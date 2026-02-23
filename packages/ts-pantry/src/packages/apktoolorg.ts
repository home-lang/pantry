/**
 * **apktool** - Tool for reverse engineering 3rd party, closed, binary Android apps
 *
 * @domain `apktool.org`
 * @programs `apktool`
 * @version `3.0.1` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apktool.org`
 * @homepage https://apktool.org/
 * @dependencies `openjdk.org^21`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apktoolorg
 * console.log(pkg.name)        // "apktool"
 * console.log(pkg.description) // "Tool for reverse engineering 3rd party, closed,..."
 * console.log(pkg.programs)    // ["apktool"]
 * console.log(pkg.versions[0]) // "3.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apktool-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apktoolorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'apktool' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'apktool.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tool for reverse engineering 3rd party, closed, binary Android apps' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apktool.org/package.yml' as const,
  homepageUrl: 'https://apktool.org/' as const,
  githubUrl: 'https://github.com/iBotPeaches/Apktool' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install apktool.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apktool.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apktool.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'apktool',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openjdk.org^21',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.0.1',
    '2.12.1',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.0',
    '2.9.3',
  ] as const,
  aliases: [] as const,
}

export type ApktoolorgPackage = typeof apktoolorgPackage
