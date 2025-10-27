import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // The base path should be the name of your repository.
    const base = '/B-n-chi-n-l-c/'; 
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      base: base, // Use the base path for deployment.
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // FIX: Replaced `process.cwd()` which was causing a type error. Using `path.resolve()`
          // with no arguments correctly resolves to the project's root directory and avoids the type error.
          '@': path.resolve(),
        }
      }
    };
});