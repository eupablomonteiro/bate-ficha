import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'], // Arquivo de entrada
  outDir: 'dist', // Pasta de saída
  format: ['cjs', 'esm'], // Formatos de saída (CommonJS e ES Modules)
  dts: false, // App (não lib): não gera .d.ts (evita erros de tipo portável com pnpm)
  clean: true, // Limpar a pasta de saída antes do build
  minify: true, // Minificar o código
  sourcemap: true, // Gerar sourcemaps
  target: 'es2020', // Target do JavaScript
});
 