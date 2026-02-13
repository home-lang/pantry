/**
 * **utf8proc** - a clean C library for processing UTF-8 Unicode data
 *
 * @domain `github.com/JuliaStrings/utf8proc`
 * @version `2.11.3` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/JuliaStrings/utf8proc`
 * @homepage http://juliastrings.github.io/utf8proc/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjuliastringsutf8proc
 * console.log(pkg.name)        // "utf8proc"
 * console.log(pkg.description) // "a clean C library for processing UTF-8 Unicode ..."
 * console.log(pkg.versions[0]) // "2.11.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/JuliaStrings/utf8proc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const utf8procPackage = {
  /**
   * The display name of this package.
   */
  name: 'utf8proc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/JuliaStrings/utf8proc' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'a clean C library for processing UTF-8 Unicode data' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/JuliaStrings/utf8proc/package.yml' as const,
  homepageUrl: 'http://juliastrings.github.io/utf8proc/' as const,
  githubUrl: 'https://github.com/JuliaStrings/utf8proc' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/JuliaStrings/utf8proc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/JuliaStrings/utf8proc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/JuliaStrings/utf8proc' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.11.3',
    '2.11.2',
    '2.11.1',
    '2.11.0',
    '2.10.0',
    '2.9.0',
    '2.8.0',
  ] as const,
  aliases: [] as const,
}

export type Utf8procPackage = typeof utf8procPackage
