/**
 * **glow** - Render markdown on the CLI, with pizzazz! 💅🏻
 *
 * @domain `charm.sh/glow`
 * @programs `glow`
 * @version `2.1.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/glow`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshglow
 * console.log(pkg.name)        // "glow"
 * console.log(pkg.description) // "Render markdown on the CLI, with pizzazz! 💅🏻"
 * console.log(pkg.programs)    // ["glow"]
 * console.log(pkg.versions[0]) // "2.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/glow.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshglowPackage = {
  /**
  * The display name of this package.
  */
  name: 'glow' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'charm.sh/glow' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Render markdown on the CLI, with pizzazz! 💅🏻' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/glow/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/charmbracelet/glow' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install charm.sh/glow' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/glow -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/glow' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'glow',
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
    '2.1.1',
    '2.1.0',
    '2.0.0',
    '1.5.1',
    '1.5.0',
    '1.4.1',
  ] as const,
  aliases: [] as const,
}

export type CharmshglowPackage = typeof charmshglowPackage
