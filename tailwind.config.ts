import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
        fontFamily: {
            mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        },
        colors: {
            // Backgrounds
            'bg-base':        'var(--bg-base)',
            'bg-surface':     'var(--bg-surface)',
            'bg-elevated':    'var(--bg-elevated)',
            'bg-tab-bar':     'var(--bg-tab-bar)',
            'bg-tab-active':  'var(--bg-tab-active)',
            'bg-tab-inactive':'var(--bg-tab-inactive)',
            'bg-sidebar':     'var(--bg-sidebar)',
            'bg-statusbar':   'var(--bg-statusbar)',
            // Text
            'text-primary':   'var(--text-primary)',
            'text-secondary': 'var(--text-secondary)',
            'text-muted':     'var(--text-muted)',
            'text-comment':   'var(--text-comment)',
            'text-keyword':   'var(--text-keyword)',
            'text-string':    'var(--text-string)',
            'text-const':     'var(--text-const)',
            // Accents
            'accent-amber':   'var(--accent-amber)',
            'accent-teal':    'var(--accent-teal)',
            'accent-blue':    'var(--accent-blue)',
            // Borders
            'border-subtle':  'var(--border-subtle)',
            'border-muted':   'var(--border-muted)',
        },
        },
    },
    plugins: [],
}

export default config