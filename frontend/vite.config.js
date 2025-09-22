import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['localhost', '127.0.0.1', '172.20.10.2', '9f4287672efa.ngrok-free.app', 'bd3b8d572dfb.ngrok-free.app'],
  },
})


