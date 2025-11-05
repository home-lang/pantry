import { dts } from 'bun-plugin-dtsx'

console.log('Building ts-pantry...')

const result = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'node',
  format: 'esm',
  plugins: [dts()],
})

if (!result.success) {
  console.error('Build failed:', result.logs)
  process.exit(1)
}

console.log('Build completed successfully!')
