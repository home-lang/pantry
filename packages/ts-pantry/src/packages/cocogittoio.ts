/**
 * **cog** - The Conventional Commits toolbox
 *
 * @domain `cocogitto.io`
 * @programs `cog`
 * @version `6.5.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cocogitto.io`
 * @homepage https://docs.cocogitto.io
 * @dependencies `libgit2.org~1.7 # links to libgit2.so.1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cocogittoio
 * console.log(pkg.name)        // "cog"
 * console.log(pkg.description) // "The Conventional Commits toolbox"
 * console.log(pkg.programs)    // ["cog"]
 * console.log(pkg.versions[0]) // "6.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cocogitto-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cocogittoioPackage = {
  /**
  * The display name of this package.
  */
  name: 'cog' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cocogitto.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Conventional Commits toolbox' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cocogitto.io/package.yml' as const,
  homepageUrl: 'https://docs.cocogitto.io' as const,
  githubUrl: 'https://github.com/cocogitto/cocogitto' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install cocogitto.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cocogitto.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cocogitto.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cog',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.5.0',
    '6.4.0',
    '6.3.0',
    '6.2.0',
    '6.1.0',
    '6.0.1',
    '6.0.0',
    '5.6.0',
    '5.5.0',
  ] as const,
  aliases: [] as const,
}

export type CocogittoioPackage = typeof cocogittoioPackage
