import { defineConfig } from 'vite';
import { viteExternalsPlugin } from 'vite-plugin-externals'

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      formats: ['cjs', 'es'],
      fileName: 'index',
    },
  },
  plugins: [
    viteExternalsPlugin({
      three: 'THREE',
    })
  ]
});