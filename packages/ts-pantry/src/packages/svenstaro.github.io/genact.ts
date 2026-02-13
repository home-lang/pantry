/**
 * **genact** - 🌀 A nonsense activity generator
 *
 * @domain `svenstaro.github.io/genact`
 * @programs `genact`
 * @version `1.5.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install svenstaro.github.io/genact`
 * @homepage https://svenstaro.github.io/genact/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.svenstarogithubiogenact
 * console.log(pkg.name)        // "genact"
 * console.log(pkg.description) // "🌀 A nonsense activity generator"
 * console.log(pkg.programs)    // ["genact"]
 * console.log(pkg.versions[0]) // "1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/svenstaro-github-io/genact.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const svenstarogithubiogenactPackage = {
  /**
   * The display name of this package.
   */
  name: 'genact' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'svenstaro.github.io/genact' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🌀 A nonsense activity generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/svenstaro.github.io/genact/package.yml' as const,
  homepageUrl: 'https://svenstaro.github.io/genact/' as const,
  githubUrl: 'https://github.com/svenstaro/genact' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install svenstaro.github.io/genact' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +svenstaro.github.io/genact -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install svenstaro.github.io/genact' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'genact',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.0',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.0',
    '1.2.2',
  ] as const,
  aliases: [] as const,
}

export type SvenstarogithubiogenactPackage = typeof svenstarogithubiogenactPackage
