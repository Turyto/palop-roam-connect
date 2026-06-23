import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Emits dist/404.html as a copy of the built index.html so that Replit Static
// Hosting serves the SPA shell for client-side routes (deep links / hard
// refreshes like /support, /orders, /admin/dashboard) instead of a hard 404.
function spaFallback() {
  return {
    name: "spa-404-fallback",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(outDir, "index.html");
      const notFoundPath = path.join(outDir, "404.html");
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
      componentTagger(),
    mode !== 'development' &&
      spaFallback(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@assets": path.resolve(__dirname, "./client/public"),
    },
  },
  root: './client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-stripe':  ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-router':  ['react-router-dom'],
          'vendor-sentry':  ['@sentry/react'],
        },
      },
    },
  },
}));
