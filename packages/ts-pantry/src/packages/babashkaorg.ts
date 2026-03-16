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
  ] as const,
  aliases: [] as const,
}

export type BabashkaorgPackage = typeof babashkaorgPackage
