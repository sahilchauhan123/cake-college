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
        milk: {
          pink: '#E4007C',           // Signature Milk Bar Hot Pink
          'pink-hover': '#C2006A',
          'pink-light': '#FFF0F6',
          'pink-subtle': '#FFE5F0',
          yellow: '#FFE600',          // Milk Bar Sunshine Yellow
          'yellow-light': '#FFFDE0',
          mint: '#00E5A3',            // Neon Fresh Mint
          'mint-light': '#E6FCF5',
          black: '#111111',           // Jet Black
          charcoal: '#242424',
          cream: '#FAFAFA',
          soft: '#F4F4F4',
        },
        bakery: {
          primary: '#E4007C',
          'primary-hover': '#C2006A',
          secondary: '#FFE600',
          dark: '#111111',
          cream: '#FFFFFF',
          soft: '#FFF0F6',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Outfit', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        serif: ['var(--font-serif)', 'Playfair Display', 'serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
      },
    },
  },
  plugins: [],
};
