/**
 * **redfishtool** - A Python34 program that implements a command line tool for accessing the Redfish API.
 *
 * @domain `github.com/DMTF/redfishtool`
 * @programs `redfishtool`
 * @version `1.1.8` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/DMTF/redfishtool`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomdmtfredfishtool
 * console.log(pkg.name)        // "redfishtool"
 * console.log(pkg.description) // "A Python34 program that implements a command li..."
 * console.log(pkg.programs)    // ["redfishtool"]
 * console.log(pkg.versions[0]) // "1.1.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/DMTF/redfishtool.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const redfishtoolPackage = {
  /**
  * The display name of this package.
  */
  name: 'redfishtool' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/DMTF/redfishtool' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A Python34 program that implements a command line tool for accessing the Redfish API.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/DMTF/redfishtool/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/DMTF/Redfishtool' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/DMTF/redfishtool' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/DMTF/redfishtool -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/DMTF/redfishtool' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'redfishtool',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@>=3<3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.8',
  ] as const,
  aliases: [] as const,
}

export type RedfishtoolPackage = typeof redfishtoolPackage
