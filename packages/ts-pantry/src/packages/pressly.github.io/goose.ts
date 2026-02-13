/**
 * **goose** - A database migration tool. Supports SQL migrations and Go functions.
 *
 * @domain `pressly.github.io/goose`
 * @programs `goose`
 * @version `3.26.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pressly.github.io/goose`
 * @homepage https://pressly.github.io/goose/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.presslygithubiogoose
 * console.log(pkg.name)        // "goose"
 * console.log(pkg.description) // "A database migration tool. Supports SQL migrati..."
 * console.log(pkg.programs)    // ["goose"]
 * console.log(pkg.versions[0]) // "3.26.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pressly-github-io/goose.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const presslygithubiogoosePackage = {
  /**
   * The display name of this package.
   */
  name: 'goose' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pressly.github.io/goose' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A database migration tool. Supports SQL migrations and Go functions. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pressly.github.io/goose/package.yml' as const,
  homepageUrl: 'https://pressly.github.io/goose/' as const,
  githubUrl: 'https://github.com/pressly/goose' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pressly.github.io/goose' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pressly.github.io/goose -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pressly.github.io/goose' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'goose',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.26.0',
    '3.25.0',
    '3.24.3',
    '3.24.2',
    '3.24.1',
    '3.24.0',
    '3.23.1',
    '3.23.0',
    '3.22.1',
    '3.22.0',
    '3.21.1',
    '3.21.0',
    '3.20.0',
  ] as const,
  aliases: [] as const,
}

export type PresslygithubiogoosePackage = typeof presslygithubiogoosePackage
