/**
 * **gum** - A tool for glamorous shell scripts 🎀
 *
 * @domain `charm.sh/gum`
 * @programs `gum`
 * @version `0.17.0` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/gum`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshgum
 * console.log(pkg.name)        // "gum"
 * console.log(pkg.description) // "A tool for glamorous shell scripts 🎀"
 * console.log(pkg.programs)    // ["gum"]
 * console.log(pkg.versions[0]) // "0.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/gum.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshgumPackage = {
  /**
  * The display name of this package.
  */
  name: 'gum' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'charm.sh/gum' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A tool for glamorous shell scripts 🎀' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/gum/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/charmbracelet/gum' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install charm.sh/gum' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/gum -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/gum' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gum',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.17.0',
    '0.16.2',
    '0.16.1',
    '0.16.0',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.5',
    '0.14.4',
    '0.14.3',
    '0.14.2',
    '0.14.1',
    '0.14.0',
    '0.13.0',
    '0.12.0',
    '0.11.0',
    '0.10.0',
    '0.9.0',
    '0.8.0',
  ] as const,
  aliases: [] as const,
}

export type CharmshgumPackage = typeof charmshgumPackage
