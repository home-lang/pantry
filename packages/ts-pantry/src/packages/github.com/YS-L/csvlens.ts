/**
 * **csvlens** - Command line csv viewer
 *
 * @domain `github.com/YS-L/csvlens`
 * @programs `csvlens`
 * @version `0.15.1` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/YS-L/csvlens`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomyslcsvlens
 * console.log(pkg.name)        // "csvlens"
 * console.log(pkg.description) // "Command line csv viewer"
 * console.log(pkg.programs)    // ["csvlens"]
 * console.log(pkg.versions[0]) // "0.15.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/YS-L/csvlens.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const csvlensPackage = {
  /**
   * The display name of this package.
   */
  name: 'csvlens' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/YS-L/csvlens' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command line csv viewer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/YS-L/csvlens/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/YS-L/csvlens' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/YS-L/csvlens' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/YS-L/csvlens -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/YS-L/csvlens' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'csvlens',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.15.1',
    '0.15.0',
    '0.14.0',
    '0.13.0',
    '0.12.0',
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.1',
    '0.8.0',
    '0.7.0',
    '0.6.0',
    '0.5.1',
  ] as const,
  aliases: [] as const,
}

export type CsvlensPackage = typeof csvlensPackage
