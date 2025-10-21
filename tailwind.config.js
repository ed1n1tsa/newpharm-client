/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./ui/**/*.{ts,tsx,js,jsx}",
    "./styles/**/*.{css,scss}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },

      // 🎨 Цветовая палитра
      colors: {
        /* --- Основная клиентская тема --- */
        background: "#FFFFFF",
        primary: "#e63946",
        text: "#001759",
        accent: "#FF0000", // для PRO / акцентных кнопок

        /* --- Админ-панель CRM (teal) --- */
        brand: {
          DEFAULT: "#14b8a6", // teal-500
          light: "#99f6e4",   // teal-200
          dark: "#0d9488",    // teal-600
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },
    },
  },
  plugins: [],
};
