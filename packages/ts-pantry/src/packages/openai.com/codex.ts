/**
 * **codex** - pkgx package
 *
 * @domain `openai.com/codex`
 * @programs `codex`, `codex-exec`, `codex-tui`, `md-events`
 * @version `0.164.0` (134 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install openai.com/codex`
 * @dependencies `linux:kernel.org/libcap^1` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.openaicomcodex
 * console.log(pkg.name)        // "codex"
 * console.log(pkg.programs)    // ["codex", "codex-exec", ...]
 * console.log(pkg.versions[0]) // "0.164.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/openai-com/codex.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const openaicomcodexPackage = {
  /**
  * The display name of this package.
  */
  name: 'codex' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'openai.com/codex' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openai.com/codex/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install openai.com/codex' as const,
  pantryInstallCommand: 'pantry install openai.com/codex' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'codex',
    'codex-exec',
    'codex-tui',
    'md-events',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:kernel.org/libcap^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.164.0',
    '0.163.0',
    '0.162.1',
    '0.162.0',
    '0.161.0',
    '0.160.1',
    '0.160.0',
    '0.159.3',
    '0.159.2',
    '0.159.1',
    '0.159.0',
    '0.158.0',
    '0.157.1',
    '0.157.0',
    '0.156.1',
    '0.156.0',
    '0.155.1',
    '0.155.0',
    '0.154.0',
    '0.153.4',
    '0.153.3',
    '0.153.2',
    '0.153.1',
    '0.153.0',
    '0.152.1',
    '0.152.0',
    '0.151.0',
    '0.150.1',
    '0.150.0',
    '0.149.1',
    '0.149.0',
    '0.148.0',
    '0.147.0',
    '0.146.1',
    '0.146.0',
    '0.145.0',
    '0.144.6',
    '0.144.5',
    '0.144.4',
    '0.144.3',
    '0.144.2',
    '0.144.1',
    '0.144.0',
    '0.143.0',
    '0.142.5',
    '0.142.4',
    '0.142.3',
    '0.142.2',
    '0.142.1',
    '0.142.0',
    '0.141.0',
    '0.140.0',
    '0.139.0',
    '0.138.0',
    '0.137.0',
    '0.136.0',
    '0.135.0',
    '0.134.0',
    '0.133.0',
    '0.132.0',
    '0.131.0',
    '0.130.0',
    '0.129.0',
    '0.116.0',
    '0.115.0',
    '0.114.0',
    '0.113.0',
    '0.112.0',
    '0.111.0',
    '0.110.0',
    '0.107.0',
    '0.106.0',
    '0.105.0',
    '0.104.0',
    '0.103.0',
    '0.102.0',
    '0.101.0',
    '0.99.0',
    '0.98.0',
    '0.97.0',
    '0.96.0',
    '0.95.0',
    '0.94.0',
    '0.93.0',
    '0.92.0',
    '0.91.0',
    '0.90.0',
    '0.89.0',
    '0.88.0',
    '0.87.0',
    '0.86.0',
    '0.85.0',
    '0.84.0',
    '0.81.0',
    '0.80.0',
    '0.79.0',
    '0.78.0',
    '0.77.0',
    '0.76.0',
    '0.75.0',
    '0.74.0',
    '0.73.0',
    '0.72.0',
    '0.71.0',
    '0.69.0',
    '0.66.0',
    '0.65.0',
    '0.64.0',
    '0.63.0',
    '0.62.0',
    '0.61.0',
    '0.60.1',
    '0.59.0',
    '0.58.0',
    '0.57.0',
    '0.56.0',
    '0.55.0',
    '0.54.0',
    '0.53.0',
    '0.52.0',
    '0.50.0',
    '0.49.0',
    '0.48.0',
    '0.47.0',
    '0.46.0',
    '0.45.0',
    '0.44.0',
    '0.42.0',
    '0.41.0',
    '0.40.0',
    '0.39.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
  ] as const,
  aliases: [] as const,
}

export type OpenaicomcodexPackage = typeof openaicomcodexPackage
