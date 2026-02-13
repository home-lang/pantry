/**
 * **encore** - Open Source Development Platform for building robust type-safe distributed systems with declarative infrastructure
 *
 * @domain `encore.dev`
 * @programs `encore`, `git-remote-encore`
 * @version `1.53.7` (96 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install encore.dev`
 * @homepage https://encore.dev
 * @dependencies `encore.dev/go^1.21`
 * @buildDependencies `go.dev@~1.23.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.encoredev
 * console.log(pkg.name)        // "encore"
 * console.log(pkg.description) // "Open Source Development Platform for building r..."
 * console.log(pkg.programs)    // ["encore", "git-remote-encore"]
 * console.log(pkg.versions[0]) // "1.53.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/encore-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const encoredevPackage = {
  /**
   * The display name of this package.
   */
  name: 'encore' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'encore.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open Source Development Platform for building robust type-safe distributed systems with declarative infrastructure' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/encore.dev/package.yml' as const,
  homepageUrl: 'https://encore.dev' as const,
  githubUrl: 'https://github.com/encoredev/encore' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install encore.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +encore.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install encore.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'encore',
    'git-remote-encore',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'encore.dev/go^1.21',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.23.3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.53.7',
    '1.53.6',
    '1.53.5',
    '1.53.4',
    '1.53.3',
    '1.53.2',
    '1.53.1',
    '1.53.0',
    '1.52.5',
    '1.52.4',
    '1.52.3',
    '1.52.2',
    '1.52.1',
    '1.51.11',
    '1.51.10',
    '1.51.9',
    '1.51.8',
    '1.51.7',
    '1.51.5',
    '1.51.4',
    '1.51.3',
    '1.51.2',
    '1.50.7',
    '1.50.6',
    '1.50.5',
    '1.50.4',
    '1.50.2',
    '1.50.1',
    '1.50.0',
    '1.49.3',
    '1.49.1',
    '1.49.0',
    '1.48.13',
    '1.48.12',
    '1.48.11',
    '1.48.10',
    '1.48.9',
    '1.48.8',
    '1.48.7',
    '1.48.6',
    '1.48.5',
    '1.48.4',
    '1.48.3',
    '1.48.2',
    '1.48.0',
    '1.47.0',
    '1.46.22',
    '1.46.21',
    '1.46.20',
    '1.46.19',
    '1.46.18',
    '1.46.17',
    '1.46.16',
    '1.46.15',
    '1.46.14',
    '1.46.13',
    '1.46.12',
    '1.46.11',
    '1.46.10',
    '1.46.9',
    '1.46.8',
    '1.46.7',
    '1.46.6',
    '1.46.5',
    '1.46.4',
    '1.46.2',
    '1.46.1',
    '1.46.0',
    '1.45.6',
    '1.45.1',
    '1.44.9',
    '1.44.4',
    '1.44.0',
    '1.43.9',
    '1.43.7',
    '1.43.3',
    '1.42.3',
    '1.42.1',
    '1.41.9',
    '1.41.7',
    '1.41.4',
    '1.41.3',
    '1.41.1',
    '1.40.0',
    '1.39.0',
    '1.38.0',
    '1.37.0',
    '1.35.3',
    '1.34.7',
    '1.31.0',
    '1.30.0',
    '1.29.2',
    '1.28.0',
    '1.27.0',
    '1.26.0',
    '1.25.0',
  ] as const,
  aliases: [] as const,
}

export type EncoredevPackage = typeof encoredevPackage
