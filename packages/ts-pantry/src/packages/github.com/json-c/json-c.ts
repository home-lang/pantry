/**
 * **json-c** - https://github.com/json-c/json-c is the official code repository for json-c.  See the wiki for release tarballs for download.  API docs at http://json-c.github.io/json-c/
 *
 * @domain `github.com/json-c/json-c`
 * @version `0.18.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/json-c/json-c`
 * @homepage https://github.com/json-c/json-c/wiki
 * @buildDependencies `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjsoncjsonc
 * console.log(pkg.name)        // "json-c"
 * console.log(pkg.description) // "https://github.com/json-c/json-c is the officia..."
 * console.log(pkg.versions[0]) // "0.18.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/json-c/json-c.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jsoncPackage = {
  /**
  * The display name of this package.
  */
  name: 'json-c' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/json-c/json-c' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'https://github.com/json-c/json-c is the official code repository for json-c.  See the wiki for release tarballs for download.  API docs at http://json-c.github.io/json-c/' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/json-c/json-c/package.yml' as const,
  homepageUrl: 'https://github.com/json-c/json-c/wiki' as const,
  githubUrl: 'https://github.com/json-c/json-c' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/json-c/json-c' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/json-c/json-c -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/json-c/json-c' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.18.0',
    '0.17.0',
    '0.16.0',
  ] as const,
  aliases: [] as const,
}

export type JsoncPackage = typeof jsoncPackage
