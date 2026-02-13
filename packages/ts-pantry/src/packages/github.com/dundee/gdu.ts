/**
 * **gdu** - Fast disk usage analyzer with console interface written in Go
 *
 * @domain `github.com/dundee/gdu`
 * @programs `gdu`
 * @version `5.32.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/dundee/gdu`
 * @homepage https://www.gnu.org/software/coreutils/
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomdundeegdu
 * console.log(pkg.name)        // "gdu"
 * console.log(pkg.description) // "Fast disk usage analyzer with console interface..."
 * console.log(pkg.programs)    // ["gdu"]
 * console.log(pkg.versions[0]) // "5.32.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/dundee/gdu.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gduPackage = {
  /**
   * The display name of this package.
   */
  name: 'gdu' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/dundee/gdu' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fast disk usage analyzer with console interface written in Go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/dundee/gdu/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/coreutils/' as const,
  githubUrl: 'https://github.com/dundee/gdu' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/dundee/gdu' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/dundee/gdu -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/dundee/gdu' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gdu',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.32.0',
    '5.31.0',
    '5.30.1',
    '5.30.0',
    '5.29.0',
  ] as const,
  aliases: [] as const,
}

export type GduPackage = typeof gduPackage
