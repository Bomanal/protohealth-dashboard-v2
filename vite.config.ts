import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Environment Variables:
// - VITE_API_BASE_URL: Backend API server URL (default: http://localhost:8000)
// - VITE_DEV_SERVER_PORT: Frontend development server port (default: 8080)
// 
// Usage: VITE_API_BASE_URL=http://your-api-server:8000 npm run dev
export default defineConfig(({ mode }) => {
  // Get API base URL from environment variable, default to localhost:8000
  const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const DEV_SERVER_PORT = parseInt(process.env.VITE_DEV_SERVER_PORT || '8080')

  return {
    server: {
      host: "::",
      port: DEV_SERVER_PORT,
      proxy: {
        '/protocol_engine': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/case-list': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/protocol-names': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/case-details': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/protocol': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
      plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
  })
