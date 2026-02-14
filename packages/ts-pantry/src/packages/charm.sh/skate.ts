/**
 * **skate** - A personal key value store 🛼
 *
 * @domain `charm.sh/skate`
 * @programs `skate`
 * @version `1.0.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/skate`
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshskate
 * console.log(pkg.name)        // "skate"
 * console.log(pkg.description) // "A personal key value store 🛼"
 * console.log(pkg.programs)    // ["skate"]
 * console.log(pkg.versions[0]) // "1.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/skate.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshskatePackage = {
  /**
  * The display name of this package.
  */
  name: 'skate' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'charm.sh/skate' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A personal key value store 🛼' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/skate/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/charmbracelet/skate' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install charm.sh/skate' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/skate -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/skate' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'skate',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.1',
    '1.0.0',
    '0.2.2',
  ] as const,
  aliases: [] as const,
}

export type CharmshskatePackage = typeof charmshskatePackage
