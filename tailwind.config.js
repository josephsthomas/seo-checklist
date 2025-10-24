/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flipside Brand Colors
        primary: {
          DEFAULT: '#0033A0', // Primary Blue
          50: '#e6ebf5',
          100: '#ccd6eb',
          200: '#99add7',
          300: '#6685c3',
          400: '#335caf',
          500: '#0033A0', // Primary Blue - Main
          600: '#002980',
          700: '#001f60',
          800: '#001440',
          900: '#000a20',
        },
        charcoal: {
          DEFAULT: '#2C2C2C', // Deep Charcoal
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#bababa',
          400: '#737373',
          500: '#2C2C2C', // Deep Charcoal - Main
          600: '#232323',
          700: '#1a1a1a',
          800: '#121212',
          900: '#090909',
        },
        purple: {
          DEFAULT: '#7F00FF', // Electric Purple
          50: '#f4e6ff',
          100: '#e9ccff',
          200: '#d299ff',
          300: '#bc66ff',
          400: '#a533ff',
          500: '#7F00FF', // Electric Purple - Main
          600: '#6600cc',
          700: '#4c0099',
          800: '#330066',
          900: '#190033',
        },
        cyan: {
          DEFAULT: '#00CFFF', // Bright Cyan
          50: '#e6f9ff',
          100: '#ccf4ff',
          200: '#99e9ff',
          300: '#66ddff',
          400: '#33d1ff',
          500: '#00CFFF', // Bright Cyan - Main
          600: '#00a6cc',
          700: '#007d99',
          800: '#005366',
          900: '#002a33',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Roboto Mono', 'Courier Prime', 'Courier New', 'monospace'],
      },
      lineHeight: {
        'readable': '1.5',
      },
    },
  },
  plugins: [],
}
