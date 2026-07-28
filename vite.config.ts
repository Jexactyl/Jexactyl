/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { dirname, resolve } from 'pathe';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';

const plugins = [
    react({
        babel: {
            plugins: ['babel-plugin-macros', 'babel-plugin-styled-components'],
        },
    }),
];

if (process.env.VITEST === undefined) {
    plugins.push(
        laravel({
            input: 'resources/scripts/index.tsx',
        }),
        compression({
            algorithms: ['brotliCompress', 'gzip'],
            include: /\.(js|css|svg|json)$/,
            threshold: 1024,
        }),
    );
}

export default defineConfig({
    define:
        process.env.VITEST === undefined
            ? {
                  'process.env': {},
                  'process.platform': null,
                  'process.version': null,
                  'process.versions': null,
              }
            : undefined,

    plugins,

    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    if (/[\\/](react|preact|scheduler)[\\/]/.test(id)) return 'vendor-react';
                    if (id.includes('react-router') || id.includes('react-dom')) return 'vendor-react';
                    if (id.includes('styled-components') || id.includes('framer-motion')) return 'vendor-styling';
                    if (id.includes('@fortawesome') || id.includes('@heroicons')) return 'vendor-icons';
                    if (id.includes('i18next')) return 'vendor-i18n';
                    if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts';
                    if (id.includes('xterm')) return 'vendor-xterm';
                    if (id.includes('formik') || id.includes('yup')) return 'vendor-forms';
                    if (id.includes('react-select')) return 'vendor-select';
                    if (id.includes('easy-peasy')) return 'vendor-state';
                },
            },
        },
    },

    server: {
        cors: {
            origin: '*',
        },
    },

    resolve: {
        alias: {
            '@': resolve(dirname(fileURLToPath(import.meta.url)), 'resources', 'scripts'),
            '@definitions': resolve(
                dirname(fileURLToPath(import.meta.url)),
                'resources',
                'scripts',
                'api',
                'definitions',
            ),
            '@feature': resolve(
                dirname(fileURLToPath(import.meta.url)),
                'resources',
                'scripts',
                'components',
                'server',
                'features',
            ),
            '@account': resolve(
                dirname(fileURLToPath(import.meta.url)),
                'resources',
                'scripts',
                'components',
                'account',
            ),
            '@server': resolve(dirname(fileURLToPath(import.meta.url)), 'resources', 'scripts', 'components', 'server'),
            '@admin': resolve(dirname(fileURLToPath(import.meta.url)), 'resources', 'scripts', 'components', 'admin'),

            react: 'preact/compat',
            'react-dom': 'preact/compat',
            'react/jsx-runtime': 'preact/jsx-runtime',
            'react-dom/test-utils': 'preact/test-utils',
        },
    },

    test: {
        environment: 'happy-dom',
        include: ['resources/scripts/**/*.{spec,test}.{ts,tsx}'],
    },
});
