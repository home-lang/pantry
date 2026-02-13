/**
 * **forc** - 🌴 Empowering everyone to build reliable and efficient smart contracts.
 *
 * @domain `fuellabs.github.io/sway`
 * @programs `forc`
 * @version `0.70.3` (85 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fuellabs.github.io/sway`
 * @homepage https://docs.fuel.network/docs/sway/
 * @dependencies `zlib.net^1`, `openssl.org^1.1`
 * @buildDependencies `perl.org`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fuellabsgithubiosway
 * console.log(pkg.name)        // "forc"
 * console.log(pkg.description) // "🌴 Empowering everyone to build reliable and ef..."
 * console.log(pkg.programs)    // ["forc"]
 * console.log(pkg.versions[0]) // "0.70.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fuellabs-github-io/sway.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fuellabsgithubioswayPackage = {
  /**
   * The display name of this package.
   */
  name: 'forc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fuellabs.github.io/sway' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🌴 Empowering everyone to build reliable and efficient smart contracts.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fuellabs.github.io/sway/package.yml' as const,
  homepageUrl: 'https://docs.fuel.network/docs/sway/' as const,
  githubUrl: 'https://github.com/FuelLabs/sway' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fuellabs.github.io/sway' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fuellabs.github.io/sway -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fuellabs.github.io/sway' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'forc',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1',
    'openssl.org^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'perl.org',
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.70.3',
    '0.70.2',
    '0.70.1',
    '0.70.0',
    '0.69.6',
    '0.69.5',
    '0.69.2',
    '0.69.1',
    '0.69.0',
    '0.68.9',
    '0.68.7',
    '0.68.6',
    '0.68.5',
    '0.68.4',
    '0.68.3',
    '0.68.2',
    '0.68.1',
    '0.68.0',
    '0.67.2',
    '0.67.1',
    '0.67.0',
    '0.66.10',
    '0.66.9',
    '0.66.8',
    '0.66.7',
    '0.66.6',
    '0.66.5',
    '0.66.4',
    '0.66.3',
    '0.66.2',
    '0.66.1',
    '0.66.0',
    '0.65.2',
    '0.65.1',
    '0.65.0',
    '0.63.6',
    '0.63.5',
    '0.63.4',
    '0.63.3',
    '0.63.2',
    '0.63.1',
    '0.63.0',
    '0.62.0',
    '0.61.2',
    '0.61.1',
    '0.61.0',
    '0.60.0',
    '0.59.0',
    '0.58.0',
    '0.57.0',
    '0.56.1',
    '0.56.0',
    '0.55.0',
    '0.54.0',
    '0.53.0',
    '0.52.1',
    '0.51.1',
    '0.51.0',
    '0.50.0',
    '0.49.3',
    '0.49.2',
    '0.49.1',
    '0.49.0',
    '0.48.1',
    '0.48.0',
    '0.47.0',
    '0.46.1',
    '0.46.0',
    '0.45.0',
    '0.44.1',
    '0.44.0',
    '0.43.2',
    '0.43.1',
    '0.43.0',
    '0.42.1',
    '0.42.0',
    '0.41.0',
    '0.40.1',
    '0.40.0',
    '0.39.1',
    '0.39.0',
    '0.38.0',
    '0.37.3',
    '0.37.2',
    '0.35.5',
  ] as const,
  aliases: [] as const,
}

export type FuellabsgithubioswayPackage = typeof fuellabsgithubioswayPackage
