/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#1a1612',
          800: '#272019',
          700: '#3a3025',
          600: '#524437',
          500: '#6b5a4a',
          400: '#8a7766',
          300: '#b0a192',
          200: '#d4c8b8',
          100: '#ede5d8',
        },
        cream: {
          50: '#faf7f2',
          100: '#f5f0e8',
          200: '#ebe3d5',
        },
        rose: {
          400: '#c97064',
          500: '#b85a4e',
          600: '#a04a40',
        },
        olive: {
          500: '#6b7b52',
          600: '#56663f',
        },
      },
      letterSpacing: {
        'wider-2': '0.2em',
        'wider-3': '0.3em',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
