/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff3ed',
          100: '#ffe3d7',
          300: '#f7a07f',
          400: '#f07a4f',
          500: '#E95420',
          600: '#cf4518',
          700: '#b83a12',
        },
        ubuntu: {
          orange: '#E95420',
          orangeHover: '#cf4518',
          aubergine: '#77216F',
          aubergineHover: '#5e1a59',
          background: '#121212',
          surface: '#1E1E1E',
          surfaceAlt: '#262626',
          border: '#2f2f2f',
          text: '#FFFFFF',
          textLight: '#1A1A1A',
          muted: '#B3B3B3',
        },
      },
      boxShadow: {
        card: '0 10px 24px -14px rgba(0, 0, 0, 0.72)',
        soft: '0 8px 20px -14px rgba(0, 0, 0, 0.6)',
      },
      borderRadius: {
        xl2: '0.625rem',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
}
