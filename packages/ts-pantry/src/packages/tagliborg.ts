/**
 * **taglib-config** - TagLib Audio Meta-Data Library
 *
 * @domain `taglib.org`
 * @programs `taglib-config`
 * @version `2.2.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install taglib.org`
 * @homepage https://taglib.org/
 * @dependencies `zlib.net^1`, `github.com/nemtrif/utfcpp^4`
 * @buildDependencies `cmake.org`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tagliborg
 * console.log(pkg.name)        // "taglib-config"
 * console.log(pkg.description) // "TagLib Audio Meta-Data Library"
 * console.log(pkg.programs)    // ["taglib-config"]
 * console.log(pkg.versions[0]) // "2.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/taglib-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tagliborgPackage = {
  /**
  * The display name of this package.
  */
  name: 'taglib-config' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'taglib.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'TagLib Audio Meta-Data Library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/taglib.org/package.yml' as const,
  homepageUrl: 'https://taglib.org/' as const,
  githubUrl: 'https://github.com/taglib/taglib' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install taglib.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +taglib.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install taglib.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'taglib-config',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net^1',
    'github.com/nemtrif/utfcpp^4',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org',
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.13.1',
  ] as const,
  aliases: [] as const,
}

export type TagliborgPackage = typeof tagliborgPackage
