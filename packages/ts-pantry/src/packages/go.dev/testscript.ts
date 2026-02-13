/**
 * **testscript** - Selected Go-internal packages factored out from the standard library
 *
 * @domain `go.dev/testscript`
 * @programs `testscript`
 * @version `1.14.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install go.dev/testscript`
 * @homepage https://github.com/rogpeppe/go-internal/tree/master/cmd/testscript
 * @buildDependencies `go.dev@~1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.godevtestscript
 * console.log(pkg.name)        // "testscript"
 * console.log(pkg.description) // "Selected Go-internal packages factored out from..."
 * console.log(pkg.programs)    // ["testscript"]
 * console.log(pkg.versions[0]) // "1.14.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/go-dev/testscript.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const godevtestscriptPackage = {
  /**
   * The display name of this package.
   */
  name: 'testscript' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'go.dev/testscript' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Selected Go-internal packages factored out from the standard library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/go.dev/testscript/package.yml' as const,
  homepageUrl: 'https://github.com/rogpeppe/go-internal/tree/master/cmd/testscript' as const,
  githubUrl: 'https://github.com/rogpeppe/go-internal' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install go.dev/testscript' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +go.dev/testscript -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install go.dev/testscript' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'testscript',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.14.1',
    '1.14.0',
    '1.13.1',
    '1.12.0',
  ] as const,
  aliases: [] as const,
}

export type GodevtestscriptPackage = typeof godevtestscriptPackage
