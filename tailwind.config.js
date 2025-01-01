import typography from "@tailwindcss/typography"
/** @type {import('tailwindcss').Config} */

const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fde6",
          100: "#e3f6d5",
          200: "#c8ecad",
          300: "#abe082",
          400: "#93d75e",
          500: "#83d146",
          600: "#7ace39",
          700: "#67b62a",
          800: "#5aa221",
          900: "#4a8c14",
          950: "#3b780c",
        },        
      },
    },
  },
  plugins: [
    typography
  ],
};

export default config