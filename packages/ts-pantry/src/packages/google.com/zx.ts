/**
 * **zx** - A tool for writing better scripts
 *
 * @domain `google.com/zx`
 * @programs `zx`
 * @version `8.8.5` (43 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.com/zx`
 * @homepage https://google.github.io/zx/
 * @dependencies `nodejs.org`
 * @buildDependencies `npmjs.com`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlecomzx
 * console.log(pkg.name)        // "zx"
 * console.log(pkg.description) // "A tool for writing better scripts"
 * console.log(pkg.programs)    // ["zx"]
 * console.log(pkg.versions[0]) // "8.8.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-com/zx.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlecomzxPackage = {
  /**
   * The display name of this package.
   */
  name: 'zx' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'google.com/zx' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool for writing better scripts' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/zx/package.yml' as const,
  homepageUrl: 'https://google.github.io/zx/' as const,
  githubUrl: 'https://github.com/google/zx' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install google.com/zx' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/zx -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.com/zx' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'zx',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'npmjs.com',
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.8.5',
    '8.8.4',
    '8.8.3',
    '8.8.2',
    '8.8.1',
    '8.8.0',
    '8.7.2',
    '8.7.1',
    '8.7.0',
    '8.6.2',
    '8.6.1',
    '8.6.0',
    '8.5.5',
    '8.5.4',
    '8.5.3',
    '8.5.2',
    '8.5.0',
    '8.4.1',
    '8.4.0',
    '8.3.2',
    '8.3.1',
    '8.3.0',
    '8.2.4',
    '8.2.3',
    '8.2.2',
    '8.2.1',
    '8.2.0',
    '8.1.9',
    '8.1.8',
    '8.1.7',
    '8.1.6',
    '8.1.5',
    '8.1.4',
    '8.1.3',
    '8.1.2',
    '8.1.1',
    '8.1.0',
    '8.0.2',
    '8.0.1',
    '8.0.0',
    '7.2.4',
    '7.2.3',
    '6.2.6',
  ] as const,
  aliases: [] as const,
}

export type GooglecomzxPackage = typeof googlecomzxPackage
