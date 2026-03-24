/**
 * **babashka** - pkgx package
 *
 * @domain `babashka.org`
 * @programs `bb`
 * @version `1.12.217` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install babashka.org`
 * @buildDependencies `pkgx.sh@>=1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.babashkaorg
 * console.log(pkg.name)        // "babashka"
 * console.log(pkg.programs)    // ["bb"]
 * console.log(pkg.versions[0]) // "1.12.217" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/babashka-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const babashkaorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'babashka' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'babashka.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/babashka.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install babashka.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +babashka.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install babashka.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bb',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'pkgx.sh@>=1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.12.217',
    '1.12.216',
    '1.12.215',
    '1.12.214',
    '1.12.213',
    '1.12.212',
    '1.12.211',
    '1.12.210',
    '1.12.209',
    '1.12.208',
    '1.12.207',
    '1.12.206',
    '1.12.205',
    '1.12.204',
    '1.12.203',
    '1.12.202',
    '1.12.201',
    '1.12.200',
    '1.12.199',
    '1.12.198',
    '1.12.197',
    '1.12.196',
    '1.12.195',
    '1.12.194',
    '1.12.193',
    '1.4.192',
    '1.3.191',
    '1.3.190',
    '1.3.189',
    '1.3.188',
    '1.3.187',
    '1.3.186',
    '1.3.185',
    '1.3.184',
    '1.3.183',
    '1.3.182',
    '1.3.181',
    '1.3.180',
    '1.3.179',
    '1.3.178',
    '1.3.177',
    '1.3.176',
    '1.3.175',
    '1.2.174',
    '1.1.173',
    '1.1.172',
    '1.1.171',
    '1.0.170',
    '1.0.169',
    '1.0.168',
  ] as const,
  aliases: [] as const,
}

export type BabashkaorgPackage = typeof babashkaorgPackage
