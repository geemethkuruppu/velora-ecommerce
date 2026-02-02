/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: '#D4AF37',
                'coastal-blue': '#4E708E',
                'coastal-cream': '#F5E6D9',
                'coastal-sky': '#94B5D9',
                'coastal-pale': '#C2D1D6',
                'coastal-teal': '#84B3B9',
            },
        },
    },
    plugins: [],
}
