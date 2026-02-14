/**
 * **lporg** - Organize Your macOS Launchpad Apps
 *
 * @domain `github.com/blacktop/lporg`
 * @programs `lporg`
 * @version `20.4.32` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/blacktop/lporg`
 * @buildDependencies `go.dev@~1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomblacktoplporg
 * console.log(pkg.name)        // "lporg"
 * console.log(pkg.description) // "Organize Your macOS Launchpad Apps"
 * console.log(pkg.programs)    // ["lporg"]
 * console.log(pkg.versions[0]) // "20.4.32" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/blacktop/lporg.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lporgPackage = {
  /**
  * The display name of this package.
  */
  name: 'lporg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/blacktop/lporg' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Organize Your macOS Launchpad Apps' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/blacktop/lporg/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/blacktop/lporg' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/blacktop/lporg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/blacktop/lporg -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/blacktop/lporg' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'lporg',
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
    '20.4.32',
  ] as const,
  aliases: [] as const,
}

export type LporgPackage = typeof lporgPackage
