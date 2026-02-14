/**
 * **sup** - Super simple deployment tool - think of it like 'make' for a network of servers
 *
 * @domain `github.com/pressly/sup`
 * @programs `sup`
 * @version `0.5.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/pressly/sup`
 * @homepage https://pressly.github.io/sup
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompresslysup
 * console.log(pkg.name)        // "sup"
 * console.log(pkg.description) // "Super simple deployment tool - think of it like..."
 * console.log(pkg.programs)    // ["sup"]
 * console.log(pkg.versions[0]) // "0.5.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/pressly/sup.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const supPackage = {
  /**
  * The display name of this package.
  */
  name: 'sup' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/pressly/sup' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Super simple deployment tool - think of it like \'make\' for a network of servers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pressly/sup/package.yml' as const,
  homepageUrl: 'https://pressly.github.io/sup' as const,
  githubUrl: 'https://github.com/pressly/sup' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/pressly/sup' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/pressly/sup -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/pressly/sup' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sup',
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
    '0.5.3',
  ] as const,
  aliases: [] as const,
}

export type SupPackage = typeof supPackage
