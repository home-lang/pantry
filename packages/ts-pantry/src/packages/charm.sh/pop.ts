/**
 * **pop** - Send emails from your terminal 📬
 *
 * @domain `charm.sh/pop`
 * @programs `pop`
 * @version `0.2.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/pop`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshpop
 * console.log(pkg.name)        // "pop"
 * console.log(pkg.description) // "Send emails from your terminal 📬"
 * console.log(pkg.programs)    // ["pop"]
 * console.log(pkg.versions[0]) // "0.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/pop.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshpopPackage = {
  /**
   * The display name of this package.
   */
  name: 'pop' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'charm.sh/pop' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Send emails from your terminal 📬' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/pop/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/charmbracelet/pop' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install charm.sh/pop' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/pop -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/pop' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pop',
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
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type CharmshpopPackage = typeof charmshpopPackage
