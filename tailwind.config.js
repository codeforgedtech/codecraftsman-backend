/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        'spin-tron': 'spin 2s linear infinite', // långsam rotering
        'glow-text': 'glow 1.5s ease-in-out infinite', // glödande text
      },
      keyframes: {
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'glow': {
          '0%': {
            textShadow: '0 0 5px rgba(0, 255, 0, 0.8), 0 0 10px rgba(0, 255, 0, 0.7)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(0, 255, 0, 1), 0 0 30px rgba(0, 255, 0, 0.7)',
          },
          '100%': {
            textShadow: '0 0 5px rgba(0, 255, 0, 0.8), 0 0 10px rgba(0, 255, 0, 0.7)',
          },
        },
      },
    },
  },
  plugins: [],
};


