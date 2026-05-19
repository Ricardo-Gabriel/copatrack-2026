/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cup: {
          green: "#00A859",
          yellow: "#FFCC00",
          blue: "#00529B",
          dark: "#0F172A",
        }
      }
    },
  },
  plugins: [],
}
