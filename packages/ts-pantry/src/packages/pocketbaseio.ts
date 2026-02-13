/**
 * **pocketbase** - Open source backend for your next project in 1 file
 *
 * @domain `pocketbase.io`
 * @programs `pocketbase`
 * @version `0.36.1` (103 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pocketbase.io`
 * @homepage https://pocketbase.io/
 * @buildDependencies `go.dev@>=1.16` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pocketbaseio
 * console.log(pkg.name)        // "pocketbase"
 * console.log(pkg.description) // "Open source backend for your next project in 1 ..."
 * console.log(pkg.programs)    // ["pocketbase"]
 * console.log(pkg.versions[0]) // "0.36.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pocketbase-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pocketbaseioPackage = {
  /**
   * The display name of this package.
   */
  name: 'pocketbase' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pocketbase.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open source backend for your next project in 1 file' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pocketbase.io/package.yml' as const,
  homepageUrl: 'https://pocketbase.io/' as const,
  githubUrl: 'https://github.com/pocketbase/pocketbase' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pocketbase.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pocketbase.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pocketbase.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pocketbase',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@>=1.16',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.36.1',
    '0.36.0',
    '0.35.1',
    '0.35.0',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.0',
    '0.31.0',
    '0.30.4',
    '0.30.3',
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.3',
    '0.29.1',
    '0.29.0',
    '0.28.4',
    '0.28.3',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.2',
    '0.27.1',
    '0.27.0',
    '0.26.6',
    '0.26.5',
    '0.26.4',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.9',
    '0.25.8',
    '0.25.7',
    '0.25.6',
    '0.25.5',
    '0.25.4',
    '0.25.3',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.3',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.12',
    '0.23.11',
    '0.23.10',
    '0.23.9',
    '0.23.8',
    '0.23.7',
    '0.23.6',
    '0.23.5',
    '0.23.4',
    '0.23.3',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.37',
    '0.22.36',
    '0.22.35',
    '0.22.34',
    '0.22.33',
    '0.22.32',
    '0.22.31',
    '0.22.30',
    '0.22.29',
    '0.22.28',
    '0.22.27',
    '0.22.26',
    '0.22.25',
    '0.22.24',
    '0.22.23',
    '0.22.22',
    '0.22.21',
    '0.22.20',
    '0.22.19',
    '0.22.18',
    '0.22.17',
    '0.22.16',
    '0.22.15',
    '0.22.14',
    '0.22.13',
    '0.22.12',
    '0.22.11',
    '0.22.10',
    '0.22.9',
    '0.22.8',
    '0.22.7',
    '0.22.6',
    '0.22.5',
    '0.22.4',
    '0.22.3',
    '0.22.2',
    '0.22.1',
    '0.22.0',
    '0.21.3',
    '0.21.2',
    '0.21.1',
    '0.21.0',
    '0.20.7',
  ] as const,
  aliases: [] as const,
}

export type PocketbaseioPackage = typeof pocketbaseioPackage
