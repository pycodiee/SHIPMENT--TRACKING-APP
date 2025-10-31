import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Custom plugin to handle nominatim proxy with headers
    {
      name: 'nominatim-proxy',
      configureServer(server) {
        server.middlewares.use('/api/nominatim', async (req, res, next) => {
          const targetUrl = req.url?.replace('/api/nominatim', '') || '';
          const fullUrl = `https://nominatim.openstreetmap.org${targetUrl}`;
          
          try {
            const response = await fetch(fullUrl, {
              headers: {
                'User-Agent': 'ShipmentApp/1.0 (contact@example.com)',
              },
            });
            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (error) {
            console.error('Nominatim proxy error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to fetch geocoding data' }));
          }
        });
      },
    },
  ].filter((p): p is NonNullable<typeof p> => p !== false && p !== null && p !== undefined),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
