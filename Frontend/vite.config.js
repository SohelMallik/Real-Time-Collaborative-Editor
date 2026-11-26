// Vite configuration helper
import { defineConfig } from 'vite'
// Official Vite plugin for React (enables JSX and Fast Refresh)
import react from '@vitejs/plugin-react'
// Official Vite plugin for Tailwind CSS v4
import tailwindcss from '@tailwindcss/vite'  

// Export Vite build and dev-server settings
// Docs: https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
