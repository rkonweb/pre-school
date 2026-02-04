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
                sky: '#92CCE1',
                yellow: '#FCC11A',
                orange: '#FF8800',
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
                heading: ['var(--font-outfit)'],
            },
        },
    },
    plugins: [],
}
