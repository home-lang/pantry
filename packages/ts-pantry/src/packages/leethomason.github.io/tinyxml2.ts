/**
 * **tinyxml2** - TinyXML2 is a simple, small, efficient, C++ XML parser that can be easily integrated into other programs.
 *
 * @domain `leethomason.github.io/tinyxml2`
 * @version `11.0.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install leethomason.github.io/tinyxml2`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.leethomasongithubiotinyxml2
 * console.log(pkg.name)        // "tinyxml2"
 * console.log(pkg.description) // "TinyXML2 is a simple, small, efficient, C++ XML..."
 * console.log(pkg.versions[0]) // "11.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/leethomason-github-io/tinyxml2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const leethomasongithubiotinyxml2Package = {
  /**
   * The display name of this package.
   */
  name: 'tinyxml2' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'leethomason.github.io/tinyxml2' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'TinyXML2 is a simple, small, efficient, C++ XML parser that can be easily integrated into other programs.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/leethomason.github.io/tinyxml2/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/leethomason/tinyxml2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install leethomason.github.io/tinyxml2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +leethomason.github.io/tinyxml2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install leethomason.github.io/tinyxml2' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '11.0.0',
    '10.1.0',
    '10.0.0',
  ] as const,
  aliases: [] as const,
}

export type Leethomasongithubiotinyxml2Package = typeof leethomasongithubiotinyxml2Package
