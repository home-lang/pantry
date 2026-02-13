/**
 * **fastgron** - High-performance JSON to GRON (greppable, flattened JSON) converter
 *
 * @domain `github.com/adamritter/fastgron`
 * @programs `fastgron`
 * @version `0.7.7` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/adamritter/fastgron`
 * @dependencies `curl.se`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/bash@^5`, `gnu.org/make`, `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomadamritterfastgron
 * console.log(pkg.name)        // "fastgron"
 * console.log(pkg.description) // " High-performance JSON to GRON (greppable, flat..."
 * console.log(pkg.programs)    // ["fastgron"]
 * console.log(pkg.versions[0]) // "0.7.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/adamritter/fastgron.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fastgronPackage = {
  /**
   * The display name of this package.
   */
  name: 'fastgron' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/adamritter/fastgron' as const,
  /**
   * Brief description of what this package does.
   */
  description: ' High-performance JSON to GRON (greppable, flattened JSON) converter' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/adamritter/fastgron/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/adamritter/fastgron' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/adamritter/fastgron' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/adamritter/fastgron -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/adamritter/fastgron' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fastgron',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'curl.se',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/bash@^5',
    'gnu.org/make',
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.7',
  ] as const,
  aliases: [] as const,
}

export type FastgronPackage = typeof fastgronPackage
