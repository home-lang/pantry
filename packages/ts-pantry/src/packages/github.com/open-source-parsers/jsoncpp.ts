/**
 * **jsoncpp** - A C++ library for interacting with JSON.
 *
 * @domain `github.com/open-source-parsers/jsoncpp`
 * @version `1.9.6` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/open-source-parsers/jsoncpp`
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomopensourceparsersjsoncpp
 * console.log(pkg.name)        // "jsoncpp"
 * console.log(pkg.description) // "A C++ library for interacting with JSON."
 * console.log(pkg.versions[0]) // "1.9.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/open-source-parsers/jsoncpp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jsoncppPackage = {
  /**
   * The display name of this package.
   */
  name: 'jsoncpp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/open-source-parsers/jsoncpp' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A C++ library for interacting with JSON.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/open-source-parsers/jsoncpp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/open-source-parsers/jsoncpp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/open-source-parsers/jsoncpp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/open-source-parsers/jsoncpp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/open-source-parsers/jsoncpp' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.9.6',
    '1.9.5',
  ] as const,
  aliases: [] as const,
}

export type JsoncppPackage = typeof jsoncppPackage
