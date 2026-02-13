/**
 * **dotenvx** - pkgx package
 *
 * @domain `dotenvx.com`
 * @programs `dotenvx`
 * @version `1.52.0` (195 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dotenvx.com`
 * @dependencies `nodejs.org^16 || ^18 || ^20`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dotenvxcom
 * console.log(pkg.name)        // "dotenvx"
 * console.log(pkg.programs)    // ["dotenvx"]
 * console.log(pkg.versions[0]) // "1.52.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dotenvx-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dotenvxcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'dotenvx' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'dotenvx.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dotenvx.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install dotenvx.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dotenvx.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dotenvx.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dotenvx',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org^16 || ^18 || ^20',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.52.0',
    '1.51.4',
    '1.51.3',
    '1.51.2',
    '1.51.1',
    '1.51.0',
    '1.50.1',
    '1.50.0',
    '1.49.1',
    '1.49.0',
    '1.48.4',
    '1.48.3',
    '1.48.2',
    '1.48.1',
    '1.48.0',
    '1.47.7',
    '1.47.6',
    '1.47.5',
    '1.47.4',
    '1.47.3',
    '1.47.2',
    '1.47.1',
    '1.47.0',
    '1.46.0',
    '1.45.2',
    '1.45.1',
    '1.45.0',
    '1.44.2',
    '1.44.1',
    '1.44.0',
    '1.43.0',
    '1.42.2',
    '1.42.1',
    '1.42.0',
    '1.41.0',
    '1.40.1',
    '1.40.0',
    '1.39.1',
    '1.39.0',
    '1.38.5',
    '1.38.4',
    '1.38.3',
    '1.38.2',
    '1.38.1',
    '1.38.0',
    '1.37.0',
    '1.36.0',
    '1.35.0',
    '1.34.0',
    '1.33.0',
    '1.32.1',
    '1.32.0',
    '1.31.3',
    '1.31.2',
    '1.31.1',
    '1.31.0',
    '1.30.1',
    '1.30.0',
    '1.29.0',
    '1.28.0',
    '1.27.0',
    '1.26.2',
    '1.26.1',
    '1.26.0',
    '1.25.2',
    '1.25.1',
    '1.25.0',
    '1.24.5',
    '1.24.4',
    '1.24.3',
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.0',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.1',
    '1.21.0',
    '1.20.1',
    '1.20.0',
    '1.19.3',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.1',
    '1.18.0',
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.0',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.3',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.1',
    '1.12.0',
    '1.11.5',
    '1.11.4',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.4',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.1',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.5',
    '1.6.4',
    '1.6.3',
    '1.6.2',
    '1.6.1',
    '1.6.0',
    '1.5.0',
    '1.4.0',
    '1.3.2',
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.45.0',
    '0.44.6',
    '0.44.5',
    '0.44.4',
    '0.44.3',
    '0.44.2',
    '0.44.1',
    '0.44.0',
    '0.43.2',
    '0.43.1',
    '0.43.0',
    '0.42.0',
    '0.41.0',
    '0.40.0',
    '0.39.0',
    '0.38.0',
    '0.37.1',
    '0.37.0',
    '0.36.1',
    '0.36.0',
    '0.35.1',
    '0.35.0',
    '0.34.0',
    '0.33.1',
    '0.33.0',
    '0.32.0',
    '0.31.1',
    '0.31.0',
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.2',
    '0.29.1',
    '0.29.0',
    '0.28.0',
    '0.27.2',
    '0.27.1',
    '0.27.0',
    '0.26.0',
    '0.25.1',
    '0.25.0',
    '0.24.0',
    '0.23.0',
    '0.22.0',
    '0.21.0',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.1',
    '0.19.0',
    '0.18.0',
    '0.17.1',
    '0.17.0',
    '0.16.1',
    '0.16.0',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.1',
    '0.13.0',
    '0.12.0',
    '0.11.0',
    '0.10.6',
    '0.8.4',
  ] as const,
  aliases: [] as const,
}

export type DotenvxcomPackage = typeof dotenvxcomPackage
