/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal-bg': '#000000',
        'terminal-text': '#ffffff',
        'terminal-green': '#00ff00',
        'terminal-yellow': '#ffff00',
        'terminal-red': '#ff0000',
        'terminal-blue': '#0080ff',
        'terminal-gray': '#808080',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
