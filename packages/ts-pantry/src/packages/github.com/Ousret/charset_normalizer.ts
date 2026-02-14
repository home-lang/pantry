/**
 * **normalizer** - Truly universal encoding detector in pure Python
 *
 * @domain `github.com/Ousret/charset_normalizer`
 * @programs `normalizer`
 * @version `3.4.4` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Ousret/charset_normalizer`
 * @homepage https://charset-normalizer.readthedocs.io/en/latest/
 * @dependencies `python.org>=3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomousretcharset_normalizer
 * console.log(pkg.name)        // "normalizer"
 * console.log(pkg.description) // "Truly universal encoding detector in pure Python"
 * console.log(pkg.programs)    // ["normalizer"]
 * console.log(pkg.versions[0]) // "3.4.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Ousret/charset_normalizer.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charset_normalizerPackage = {
  /**
  * The display name of this package.
  */
  name: 'normalizer' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/Ousret/charset_normalizer' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Truly universal encoding detector in pure Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Ousret/charset_normalizer/package.yml' as const,
  homepageUrl: 'https://charset-normalizer.readthedocs.io/en/latest/' as const,
  githubUrl: 'https://github.com/Ousret/charset_normalizer' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/Ousret/charset_normalizer' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Ousret/charset_normalizer -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Ousret/charset_normalizer' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'normalizer',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org>=3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.4.4',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.2',
  ] as const,
  aliases: [] as const,
}

export type Charset_normalizerPackage = typeof charset_normalizerPackage
