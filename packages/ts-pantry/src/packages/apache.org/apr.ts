/**
 * **apr** - Mirror of Apache Portable Runtime
 *
 * @domain `apache.org/apr`
 * @version `1.7.6` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install apache.org/apr`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.apacheorgapr
 * console.log(pkg.name)        // "apr"
 * console.log(pkg.description) // "Mirror of Apache Portable Runtime"
 * console.log(pkg.versions[0]) // "1.7.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/apache-org/apr.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const apacheorgaprPackage = {
  /**
  * The display name of this package.
  */
  name: 'apr' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'apache.org/apr' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Mirror of Apache Portable Runtime' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/apr/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/apache/apr' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install apache.org/apr' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apache.org/apr -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install apache.org/apr' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.3',
    '1.7.2',
  ] as const,
  aliases: [] as const,
}

export type ApacheorgaprPackage = typeof apacheorgaprPackage
