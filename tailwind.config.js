/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Refreshing Summer Fun Palette
                navy: '#0C3449',
                teal: '#2D9CB8',
                brand: 'var(--brand-color)',
                primary: 'var(--brand-color)',
                sky: '#92CCE1',
                yellow: '#FCC11A',
                orange: '#FF8800',
            },
            fontFamily: {
                sans: ['var(--font-poppins)', 'var(--font-inter)'], // Prioritize Poppins
                heading: ['var(--font-outfit)'],
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0) translateX(-50%)' },
                    '50%': { transform: 'translateY(-10px) translateX(-50%)' },
                },
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                }
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
            }
        },
    },
    plugins: [],
}
