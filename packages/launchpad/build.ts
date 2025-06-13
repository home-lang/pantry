import { dts } from 'bun-plugin-dtsx'

await Bun.build({
  entrypoints: ['src/index.ts', 'bin/cli.ts'],
  outdir: './dist',
  target: 'bun',
  format: 'esm',
  splitting: true,
  minify: true,
  plugins: [dts()],
  external: [
    // Playwright and related dependencies
    'playwright',
    'playwright-core',
    'chromium-bidi',
    'electron',
    // Additional patterns that might cause issues
    'chromium-bidi/*',
    'playwright-core/*',
    'playwright/*',
    'electron/*',
    // Browser-related modules that shouldn't be bundled
    '@playwright/test',
    'puppeteer',
    'puppeteer-core',
  ],
  define: {
    // Define globals that might be referenced but not needed
    'process.env.PLAYWRIGHT_BROWSERS_PATH': 'undefined',
    'process.env.ELECTRON_RUN_AS_NODE': 'undefined',
  },
})
