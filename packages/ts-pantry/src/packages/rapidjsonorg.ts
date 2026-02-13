/**
 * **rapidjson** - A fast JSON parser/generator for C++ with both SAX/DOM style API
 *
 * @domain `rapidjson.org`
 * @version `1.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rapidjson.org`
 * @homepage http://rapidjson.org/
 * @buildDependencies `cmake.org@3`, `doxygen.nl@1`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rapidjsonorg
 * console.log(pkg.name)        // "rapidjson"
 * console.log(pkg.description) // "A fast JSON parser/generator for C++ with both ..."
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rapidjson-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rapidjsonorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'rapidjson' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rapidjson.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A fast JSON parser/generator for C++ with both SAX/DOM style API' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rapidjson.org/package.yml' as const,
  homepageUrl: 'http://rapidjson.org/' as const,
  githubUrl: 'https://github.com/Tencent/rapidjson' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rapidjson.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rapidjson.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rapidjson.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@3',
    'doxygen.nl@1',
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type RapidjsonorgPackage = typeof rapidjsonorgPackage
