import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    base: '/Herdsman-Phaser-game/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: path.resolve(__dirname, 'index.html')
        }
    }
});
