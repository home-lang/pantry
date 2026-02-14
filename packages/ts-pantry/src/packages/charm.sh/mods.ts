/**
 * **mods** - AI on the command line
 *
 * @domain `charm.sh/mods`
 * @programs `mods`
 * @version `1.8.1` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/mods`
 * @buildDependencies `go.dev@~1.24.0` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshmods
 * console.log(pkg.name)        // "mods"
 * console.log(pkg.description) // "AI on the command line"
 * console.log(pkg.programs)    // ["mods"]
 * console.log(pkg.versions[0]) // "1.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/mods.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshmodsPackage = {
  /**
  * The display name of this package.
  */
  name: 'mods' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'charm.sh/mods' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'AI on the command line' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/mods/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/charmbracelet/mods' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install charm.sh/mods' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/mods -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/mods' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mods',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.24.0',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.8.1',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.1',
    '1.3.0',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.0',
    '1.0.0',
    '0.2.0',
    '0.1.1',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type CharmshmodsPackage = typeof charmshmodsPackage
