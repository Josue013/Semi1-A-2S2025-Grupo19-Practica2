import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './', // Rutas relativas para build
  build: {
    outDir: 'dist',
    assetsDir: 'assets2'
  },
  // ✅ CONFIGURACIÓN DE PROXY PARA CORS
  server: {
    port: 5173,
    proxy: {
      // Proxy para Azure Functions directo (para obtener recetas)
      '/api/direct': {
        target: 'https://func-recetas-api.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/direct/, '/api'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error (direct):', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying request (direct):', req.method, req.url);
          });
        }
      },
      // Proxy para API Management Gateway (para operaciones con auth)
      '/api/gateway': {
        target: 'https://apim-recetas-g19.azure-api.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/gateway/, '/func-recetas-api'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error (gateway):', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying request (gateway):', req.method, req.url);
          });
        }
      }
    }
  },
  // ✅ VARIABLES DE ENTORNO PARA DIFERENTES AMBIENTES
  define: {
    __IS_DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  }
})