import type { NextConfig } from "next";

/**
 * Docker build profile (DOCKER_BUILD=true, set in the Dockerfile).
 * Everything here is opt-in so the Vercel build is untouched.
 */
const isDocker = process.env.DOCKER_BUILD === "true";

const originOf = (url?: string): string | undefined => {
  try {
    return url ? new URL(url).origin : undefined;
  } catch {
    return undefined;
  }
};

// Same defaults as lib/constants.ts (which can't be imported from here).
const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const isHttps = siteUrl.startsWith("https://");
const ambientOrigins = [1, 2, 3]
  .map((n) => originOf(process.env[`NEXT_PUBLIC_AMBIENT_TRACK_${n}_URL`]))
  .filter((o): o is string => Boolean(o));

/**
 * Content-Security-Policy. Allowed sources, and why:
 *  - script 'unsafe-inline': Next's hydration bootstrap is inline; the pages are
 *    static, so per-request nonces aren't possible. External scripts stay limited
 *    to Cloudflare Turnstile.
 *  - style 'unsafe-inline': React inline style attributes.
 *  - img https:: project thumbnails and album art come from arbitrary hosts.
 *  - connect: this site, the API (read from NEXT_PUBLIC_API_URL) and Turnstile.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  ["media-src 'self'", ...ambientOrigins].join(" "),
  ["connect-src 'self'", apiOrigin, "https://challenges.cloudflare.com"].filter(Boolean).join(" "),
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // HSTS only makes sense (and is only honoured) when the site is served over HTTPS.
  ...(isHttps ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const dockerConfig: NextConfig = {
  // Self-contained server in .next/standalone; the runtime image copies only that.
  output: "standalone",
  // Don't advertise the framework.
  poweredByHeader: false,
  // gzip inside Node roughly halves throughput (measured: ~485 -> ~850 req/s with it
  // off). Behind the bundled Caddy proxy, which compresses better and cheaper, build
  // with NEXT_COMPRESS=false. Default stays on so a bare `docker run` is still fine.
  compress: process.env.NEXT_COMPRESS !== "false",
  // Every <Image> in this app is already `unoptimized`. Disabling the optimizer
  // removes /_next/image and lets sharp (~30 MB of native binaries) be left out.
  images: { unoptimized: true },
  outputFileTracingExcludes: { "*": ["node_modules/@img/**", "node_modules/sharp/**"] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Hashed build assets under /_next/static are already immutable. These are
      // the unhashed files in public/, which Next otherwise revalidates every time.
      {
        source: "/:all*(mp3|svg|png|jpg|jpeg|webp|ico)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/resume.pdf",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
};

const nextConfig: NextConfig = {
  /**
   * Disable source maps in production builds.
   * This prevents clean, readable code from being exposed in the browser's DevTools.
   * Highly recommended for any public deployment.
   */
  productionBrowserSourceMaps: false,

  // Docker-only hardening and slimming (see the `docker` const above). Spread in
  // so Vercel and plain `npm run build` get exactly the config they had before.
  ...(isDocker && dockerConfig),

  /**
   * Compiler optimizations for production.
   * Removes console.* statements to reduce bundle size and eliminate debug output.
   */
  compiler: {
    removeConsole: true,
  },

  /**
   * Acknowledges that Turbopack (the `next dev` default since Next 16) and the
   * `webpack` config below intentionally coexist. Turbopack never reads the
   * webpack config — it only applies when `next build --webpack` runs, which
   * is how `npm run build` is defined in package.json. This empty object's
   * only purpose is to tell Next "yes, this is on purpose," silencing the
   * "Turbopack + webpack config, is this a mistake?" warning at dev startup.
   */
  turbopack: {},

  /**
   * Custom webpack configuration with JavaScript obfuscation.
   * Obfuscation is applied only to client-side bundles in production builds.
   * This configuration balances strong reverse-engineering protection with acceptable
   * performance and bundle size for a personal portfolio.
   */
  webpack: (config, { isServer, dev }) => {
    // Apply obfuscation only to client-side production bundles
    if (!isServer && !dev) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const webpackObfuscator = require("webpack-obfuscator");

      config.plugins.push(
        new webpackObfuscator({
          // Core settings - minimal performance impact
          compact: true,
          disableConsoleOutput: true,
          identifierNamesGenerator: "hexadecimal",

          // Moderate protection features - good balance between security and speed
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.5, // 0.0 = off, 1.0 = max (higher = slower + bigger)
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.3,
          stringArray: true,
          stringArrayEncoding: ["rc4"],
          stringArrayThreshold: 0.6,

          // Additional low-impact hardening options
          splitStrings: true,
          splitStringsChunkLength: 5,           // Split long strings into smaller chunks
          numbersToExpressions: true,           // Convert numbers into expressions (e.g. 100 → 0x64)
          simplify: true,                       // Apply code simplifications before obfuscation
          transformObjectKeys: true,            // Obfuscate object property keys
          stringArrayShuffle: true,             // Randomize string array order
          rotateStringArray: true,              // Rotate string array on each build
          selfDefending: true,                  // Adds self-defense against tampering/debugging

          // Important: Keep this disabled for Next.js/React compatibility
          renameGlobals: false,
        })
      );
    }

    return config;
  },
};

export default nextConfig;