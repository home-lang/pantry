/**
 * **modernc.org/goyacc** - Parser Generator for Go
 *
 * @domain `modernc.org/goyacc`
 * @programs `goyacc`
 * @version `1.0.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install modernc.org/goyacc`
 * @homepage https://pkg.go.dev/modernc.org/goyacc
 * @buildDependencies `go.dev@~1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.moderncorggoyacc
 * console.log(pkg.name)        // "modernc.org/goyacc"
 * console.log(pkg.description) // "Parser Generator for Go"
 * console.log(pkg.programs)    // ["goyacc"]
 * console.log(pkg.versions[0]) // "1.0.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/modernc-org/goyacc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const moderncorggoyaccPackage = {
  /**
   * The display name of this package.
   */
  name: 'modernc.org/goyacc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'modernc.org/goyacc' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Parser Generator for Go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/modernc.org/goyacc/package.yml' as const,
  homepageUrl: 'https://pkg.go.dev/modernc.org/goyacc' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install modernc.org/goyacc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +modernc.org/goyacc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install modernc.org/goyacc' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'goyacc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.3',
  ] as const,
  aliases: [] as const,
}

export type ModerncorggoyaccPackage = typeof moderncorggoyaccPackage
