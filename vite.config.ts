
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // react-router@7 é ESM-only com exports complexos; alias força resolução direta pro CJS bundled
  resolve: {
    alias: [
      // Importa o bundle CJS unificado (já existe em dist/development/index.js)
      { find: /^react-router\/dom$/, replacement: path.resolve('./node_modules/react-router/dist/development/dom-export.js') },
      { find: /^react-router$/, replacement: path.resolve('./node_modules/react-router/dist/development/index.js') },
      { find: /^react-router-dom$/, replacement: path.resolve('./node_modules/react-router-dom/dist/index.js') },
      // @google/genai 1.52.0 tem bug: package.json aponta pra .mjs que não existem.
      // Aponta direto pro .cjs (único bundle válido nesse diretório)
      { find: /^@google\/genai$/, replacement: path.resolve('./node_modules/@google/genai/dist/node/index.cjs') },
      // @reduxjs/toolkit tem exports complexos; CJS bundle funciona com commonjsOptions
      { find: /^@reduxjs\/toolkit$/, replacement: path.resolve('./node_modules/@reduxjs/toolkit/dist/cjs/index.js') },
      // redux (transitive dep) mesma situação
      { find: /^redux$/, replacement: path.resolve('./node_modules/redux/dist/redux.legacy-esm.js') }
    ]
  },
  optimizeDeps: {
    include: ['react-router-dom', '@google/genai', '@reduxjs/toolkit', 'redux']
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      input: {
        main: './index.html'
      },
      // @google/genai tem chain pesada (google-auth-library, gaxios) que
      // não roda no browser. Marcamos como external pra Vite não tentar bundlear.
      // O frontend continua funcionando sem IA até movermos pro backend.
      external: ['@google/genai', 'google-auth-library', 'gaxios', 'google-logging-utils']
    }
  }
});
