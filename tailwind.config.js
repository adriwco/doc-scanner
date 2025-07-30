// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#3B82F6',
        secondary: '#A855F7',
        onPrimary: '#FFFFFF',
        onBackground: '#EAEAEA',
        onSurface: '#CCCCCC',
      },
    },
  },
  plugins: [],
};
