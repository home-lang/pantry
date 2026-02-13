/**
 * **encore-go** - Encore's rolling fork of Go with added automatic tracing & instrumentation
 *
 * @domain `encore.dev/go`
 * @programs `encore-go`
 * @version `1.25.4` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install encore.dev/go`
 * @homepage https://encore.dev
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `curl.se`, `gnu.org/tar` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.encoredevgo
 * console.log(pkg.name)        // "encore-go"
 * console.log(pkg.description) // "Encore's rolling fork of Go with added automati..."
 * console.log(pkg.programs)    // ["encore-go"]
 * console.log(pkg.versions[0]) // "1.25.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/encore-dev/go.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const encoredevgoPackage = {
  /**
   * The display name of this package.
   */
  name: 'encore-go' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'encore.dev/go' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Encore\'s rolling fork of Go with added automatic tracing & instrumentation' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/encore.dev/go/package.yml' as const,
  homepageUrl: 'https://encore.dev' as const,
  githubUrl: 'https://github.com/encoredev/go' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install encore.dev/go' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +encore.dev/go -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install encore.dev/go' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'encore-go',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
    'gnu.org/tar',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.25.4',
    '1.23.0',
    '1.22.5',
    '1.22.0',
    '1.21.6',
    '1.21.5',
    '1.21.4',
    '1.21.3',
    '1.21.1',
  ] as const,
  aliases: [] as const,
}

export type EncoredevgoPackage = typeof encoredevgoPackage
