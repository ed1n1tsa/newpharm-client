/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        background: "#FFFFFF",
        primary: "#e63946",
        text: "#001759",
        accent: "#FF0000", // для PRO
      },
    },
  },
  plugins: [],
};
