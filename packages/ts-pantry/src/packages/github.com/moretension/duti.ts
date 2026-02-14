/**
 * **duti** - A command-line tool to select default applications for document types and URL schemes on Mac OS X
 *
 * @domain `github.com/moretension/duti`
 * @programs `duti`
 * @version `1.5.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/moretension/duti`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommoretensionduti
 * console.log(pkg.name)        // "duti"
 * console.log(pkg.description) // "A command-line tool to select default applicati..."
 * console.log(pkg.programs)    // ["duti"]
 * console.log(pkg.versions[0]) // "1.5.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/moretension/duti.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dutiPackage = {
  /**
  * The display name of this package.
  */
  name: 'duti' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/moretension/duti' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A command-line tool to select default applications for document types and URL schemes on Mac OS X' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/moretension/duti/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/moretension/duti' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/moretension/duti' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/moretension/duti -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/moretension/duti' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'duti',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.5.4',
  ] as const,
  aliases: [] as const,
}

export type DutiPackage = typeof dutiPackage
