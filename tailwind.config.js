/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -60%) scale(1.1)' },
        },
        floatDelayed: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1.1)' },
          '50%': { transform: 'translate(-50%, -40%) scale(1)' },
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delayed': 'floatDelayed 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}; 