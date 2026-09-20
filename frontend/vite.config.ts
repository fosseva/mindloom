import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ mode }) => {
    const environment = loadEnv(mode, '.', 'VITE_');

    return {
        plugins: [react(), tailwindcss()],
        server: {
            host: environment.VITE_APP_HOST,
            port: 5174,
        },
    };
});
