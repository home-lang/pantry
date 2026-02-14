/**
 * **pcre2** - Perl compatible regular expressions library with a new API
 *
 * @domain `pcre.org/v2`
 * @programs `pcre2-config`, `pcre2grep`, `pcre2test`
 * @version `10.47.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pcre.org/v2`
 * @homepage https://www.pcre.org/
 * @dependencies `sourceware.org/bzip2@1`, `zlib.net@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pcreorgv2
 * console.log(pkg.name)        // "pcre2"
 * console.log(pkg.description) // "Perl compatible regular expressions library wit..."
 * console.log(pkg.programs)    // ["pcre2-config", "pcre2grep", ...]
 * console.log(pkg.versions[0]) // "10.47.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pcre-org/v2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pcreorgv2Package = {
  /**
  * The display name of this package.
  */
  name: 'pcre2' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pcre.org/v2' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Perl compatible regular expressions library with a new API' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pcre.org/v2/package.yml' as const,
  homepageUrl: 'https://www.pcre.org/' as const,
  githubUrl: 'https://github.com/PCRE2Project/pcre2' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install pcre.org/v2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pcre.org/v2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pcre.org/v2' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pcre2-config',
    'pcre2grep',
    'pcre2test',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'sourceware.org/bzip2@1',
    'zlib.net@1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '10.47.0',
    '10.46.0',
    '10.44.0',
    '10.43.0',
    '10.42.0',
  ] as const,
  aliases: [] as const,
}

export type Pcreorgv2Package = typeof pcreorgv2Package
