/**
 * **freeze** - Generate images of code and terminal output 📸
 *
 * @domain `charm.sh/freeze`
 * @programs `freeze`
 * @version `0.2.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/freeze`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshfreeze
 * console.log(pkg.name)        // "freeze"
 * console.log(pkg.description) // "Generate images of code and terminal output 📸"
 * console.log(pkg.programs)    // ["freeze"]
 * console.log(pkg.versions[0]) // "0.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/freeze.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshfreezePackage = {
  /**
  * The display name of this package.
  */
  name: 'freeze' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'charm.sh/freeze' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Generate images of code and terminal output 📸' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/freeze/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/charmbracelet/freeze' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install charm.sh/freeze' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/freeze -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/freeze' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'freeze',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.6',
    '0.1.4',
  ] as const,
  aliases: [] as const,
}

export type CharmshfreezePackage = typeof charmshfreezePackage
