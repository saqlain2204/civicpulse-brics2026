/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        surface: {
          DEFAULT: 'var(--bg)',
          2: 'var(--bg-2)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
        },
      },
      borderColor: { DEFAULT: 'var(--border)' },
      animation: {
        'fade-up':    'fadeUp 0.5s ease both',
        'fade-in':    'fadeIn 0.4s ease both',
        'float':      'float 4s ease-in-out infinite',
        'slide-right':'slideInRight 0.5s ease both',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp:       { from: { opacity:0, transform:'translateY(16px)' }, to: { opacity:1, transform:'translateY(0)' } },
        fadeIn:       { from: { opacity:0 }, to: { opacity:1 } },
        float:        { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        slideInRight: { from: { opacity:0, transform:'translateX(24px)' }, to: { opacity:1, transform:'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
