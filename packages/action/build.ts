await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'node',
  format: 'cjs',
  minify: true,
})
