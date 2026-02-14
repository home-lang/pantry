/**
 * **rye** - Experimental Package Management Solution for Python
 *
 * @domain `rye.astral.sh`
 * @programs `rye`
 * @version `0.44.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rye.astral.sh`
 * @homepage https://rye-up.com/
 * @dependencies `curl.se/ca-certs`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ryeastralsh
 * console.log(pkg.name)        // "rye"
 * console.log(pkg.description) // "Experimental Package Management Solution for Py..."
 * console.log(pkg.programs)    // ["rye"]
 * console.log(pkg.versions[0]) // "0.44.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rye-astral-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ryeastralshPackage = {
  /**
  * The display name of this package.
  */
  name: 'rye' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rye.astral.sh' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Experimental Package Management Solution for Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rye.astral.sh/package.yml' as const,
  homepageUrl: 'https://rye-up.com/' as const,
  githubUrl: 'https://github.com/astral-sh/rye' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rye.astral.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rye.astral.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rye.astral.sh' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rye',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.44.0',
    '0.43.0',
    '0.42.0',
    '0.41.0',
    '0.40.0',
    '0.39.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
  ] as const,
  aliases: [] as const,
}

export type RyeastralshPackage = typeof ryeastralshPackage
