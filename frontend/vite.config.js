import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite-Konfiguration für WeatherWise
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
