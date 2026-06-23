import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Disable source maps in production builds.
   * This prevents clean, readable code from being exposed in the browser's DevTools.
   * Highly recommended for any public deployment.
   */
  productionBrowserSourceMaps: false,

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