import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Split heavy vendor chunks so the initial bundle stays small for mobile players.
    rollupOptions: {
      output: {
        manualChunks: {
          firebase:  ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          recharts:  ['recharts'],
          motion:    ['framer-motion'],
          qrcode:    ['qrcode.react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
