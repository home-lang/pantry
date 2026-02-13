/**
 * **mercure** - 🪽 An open, easy, fast, reliable and battery-efficient solution for real-time communications
 *
 * @domain `mercure.rocks`
 * @programs `mercure`
 * @version `0.21.6` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mercure.rocks`
 * @homepage https://mercure.rocks
 * @buildDependencies `go.dev@^1.19`, `goreleaser.com@>=2.4.2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mercurerocks
 * console.log(pkg.name)        // "mercure"
 * console.log(pkg.description) // "🪽 An open, easy, fast, reliable and battery-ef..."
 * console.log(pkg.programs)    // ["mercure"]
 * console.log(pkg.versions[0]) // "0.21.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mercure-rocks.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mercurerocksPackage = {
  /**
   * The display name of this package.
   */
  name: 'mercure' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mercure.rocks' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🪽 An open, easy, fast, reliable and battery-efficient solution for real-time communications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mercure.rocks/package.yml' as const,
  homepageUrl: 'https://mercure.rocks' as const,
  githubUrl: 'https://github.com/dunglas/mercure' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mercure.rocks' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mercure.rocks -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mercure.rocks' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mercure',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
    'goreleaser.com@>=2.4.2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.21.6',
    '0.21.5',
    '0.21.4',
    '0.21.3',
    '0.21.2',
    '0.21.1',
    '0.21.0',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.3',
    '0.19.2',
    '0.19.1',
    '0.19.0',
    '0.18.4',
    '0.18.3',
    '0.18.2',
    '0.18.1',
    '0.18.0',
    '0.17.1',
    '0.17.0',
    '0.16.3',
  ] as const,
  aliases: [] as const,
}

export type MercurerocksPackage = typeof mercurerocksPackage
