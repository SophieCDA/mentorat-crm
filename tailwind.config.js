/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          pink: '#F22E77',
          turquoise: '#42B4B7',
          purple: '#7978E2',
        },
      },
      animation: {
        float: 'float 20s infinite ease-in-out',
        'float-delay-1': 'float 20s infinite ease-in-out 5s',
        'float-delay-2': 'float 20s infinite ease-in-out 10s',
        'slide-up': 'slide-up 0.6s ease-out',
        'pulse-slow': 'pulse-slow 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(240deg)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
