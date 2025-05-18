import { dts } from 'bun-plugin-dtsx'

await Bun.build({
  entrypoints: ['src/index.ts', 'bin/cli.ts'],
  outdir: './dist',
  target: 'node',
  format: 'esm',
  splitting: true,
  minify: true,
  plugins: [dts()],
})
