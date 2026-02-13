import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import { dts } from 'bun-plugin-dtsx'

async function build() {
  console.log('Building...')
  const result = await Bun.build({
    entrypoints: ['src/index.ts', 'bin/cli.ts'],
    outdir: './dist',
    target: 'node',
    splitting: true,
    minify: true,
    plugins: [dts()],
  })

  if (!result.success) {
    console.error('Build failed:', result.logs)
    process.exit(1)
  }

  // Manually copy generated-package-names.ts as .d.ts to preserve formatting
  // This file has special formatting requirements that bun-plugin-dtsx mangles
  const generatedSrc = path.join(process.cwd(), 'src', 'generated-package-names.ts')
  const generatedDest = path.join(process.cwd(), 'dist', 'generated-package-names.d.ts')
  if (fs.existsSync(generatedSrc)) {
    const content = fs.readFileSync(generatedSrc, 'utf-8')
    // Convert .ts to .d.ts by removing any non-type exports
    const dtsContent = content.replace(/^(export\s+)(?!type\s|interface\s)/gm, '$1declare ')
    fs.writeFileSync(generatedDest, dtsContent, 'utf-8')
    console.log('Copied generated-package-names.ts -> generated-package-names.d.ts')
  }

  console.log('Build completed successfully!')
}

build().catch((error) => {
  console.error('Build error:', error)
  process.exit(1)
})
