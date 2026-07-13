/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        band: {
          platinum: '#6366f1',
          'high-green': '#22c55e',
          'medium-green': '#84cc16',
          'low-green': '#eab308',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
