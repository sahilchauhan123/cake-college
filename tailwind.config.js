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
        bakery: {
          primary: '#8B4513',
          'primary-hover': '#72360E',
          secondary: '#D97706',
          dark: '#231815',
          cream: '#FDFBF7',
          soft: '#FAF4EB',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Outfit', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
