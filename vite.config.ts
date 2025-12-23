import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Base public path for Vercel
    base: '/',
    
    // Development server settings
    server: {
      host: '::',
      port: 5173,
    },
    
    // Build settings
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@supabase/supabase-js', '@tanstack/react-query'],
          },
        },
      },
    },
    
    // Plugins
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    
    // Resolve aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    // Environment variables
    define: {
      'process.env': {
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      },
    },
  };
});
