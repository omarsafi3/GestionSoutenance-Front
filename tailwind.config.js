/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        ocean: '#0f766e',
        coral: '#e35d4f',
        sun: '#f6b642',
        grape: '#6d5dfc'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 32, 51, 0.12)',
        lift: '0 26px 70px rgba(23, 32, 51, 0.18)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.8s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
