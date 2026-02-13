/**
 * **codex** - pkgx package
 *
 * @domain `openai.com/codex`
 * @version `0.89.0` (47 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openai.com/codex`
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openaicomcodex
 * console.log(pkg.name)        // "codex"
 * console.log(pkg.versions[0]) // "0.89.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openai-com/codex.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openai.com/codex' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openai.com/codex -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openai.com/codex' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
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
