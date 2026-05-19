import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/NOME-DO-REPOSITORIO/', // Descomente e altere se for subir para um subcaminho no GitHub Pages
})
