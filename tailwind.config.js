import typography from "@tailwindcss/typography"
/** @type {import('tailwindcss').Config} */

const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7f4ff",
          100: "#ede7ff",
          200: "#d9c7ff",
          300: "#c2a0ff",
          400: "#a876ff",
          500: "#6a46d1",
          600: "#5d3bb8",
          700: "#4f319f",
          800: "#422885",
          900: "#361f6c",
          950: "#2a1753",
        },        
      },
    },
  },
  plugins: [
    typography
  ],
};

export default config