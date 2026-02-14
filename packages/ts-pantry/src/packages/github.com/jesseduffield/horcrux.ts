/**
 * **horcrux** - Split your file into encrypted fragments so that you don't need to remember a passcode
 *
 * @domain `github.com/jesseduffield/horcrux`
 * @programs `horcrux`
 * @version `0.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jesseduffield/horcrux`
 * @buildDependencies `go.dev@^1.14` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjesseduffieldhorcrux
 * console.log(pkg.name)        // "horcrux"
 * console.log(pkg.description) // "Split your file into encrypted fragments so tha..."
 * console.log(pkg.programs)    // ["horcrux"]
 * console.log(pkg.versions[0]) // "0.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jesseduffield/horcrux.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const horcruxPackage = {
  /**
  * The display name of this package.
  */
  name: 'horcrux' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/jesseduffield/horcrux' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Split your file into encrypted fragments so that you don\'t need to remember a passcode' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jesseduffield/horcrux/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jesseduffield/horcrux' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/jesseduffield/horcrux' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jesseduffield/horcrux -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jesseduffield/horcrux' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'horcrux',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.14',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.0',
  ] as const,
  aliases: [] as const,
}

export type HorcruxPackage = typeof horcruxPackage
