/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        'text-retro-logo-purple',
        'font-logo',
        'font-brand'
    ],
    theme: {
        extend: {
            colors: {
                retro: {
                    paper: '#f8fafc',    // Slate-50
                    surface: '#ffffff',  // White
                    border: '#1e293b',   // Slate-800
                    muted: '#64748b',    // Slate-500
                    primary: '#2563eb',  // Royal Blue
                    'logo-purple': '#6252F8', // Custom Purple for Logo
                }
            },
            boxShadow: {
                'pro': '2px 2px 0px 0px rgba(30, 41, 59, 1)',
                'pro-sm': '1px 1px 0px 0px rgba(30, 41, 59, 1)',
            },
            fontFamily: {
                brand: ['"Silkscreen"', 'cursive'],
                logo: ['"Press Start 2P"', 'cursive'],
                mono: ['"JetBrains Mono"', '"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
                sans: ['"Inter"', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0px',
                'none': '0px',
                'sm': '0px',
                'md': '0px',
                'lg': '0px',
                'xl': '0px',
                '2xl': '0px',
                'full': '9999px', // Keep full for circles if strictly needed, but mostly 0
            }
        },
    },
    plugins: [],
}
