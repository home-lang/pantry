/**
 * **uriparse** - :hocho: Strictly RFC 3986 compliant URI parsing and handling library written in C89; moved from SourceForge to GitHub
 *
 * @domain `uriparser.github.io`
 * @programs `uriparse`
 * @version `1.0.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install uriparser.github.io`
 * @homepage https://uriparser.github.io/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.uriparsergithubio
 * console.log(pkg.name)        // "uriparse"
 * console.log(pkg.description) // " :hocho: Strictly RFC 3986 compliant URI parsin..."
 * console.log(pkg.programs)    // ["uriparse"]
 * console.log(pkg.versions[0]) // "1.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/uriparser-github-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const uriparsergithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'uriparse' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'uriparser.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: ' :hocho: Strictly RFC 3986 compliant URI parsing and handling library written in C89; moved from SourceForge to GitHub' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/uriparser.github.io/package.yml' as const,
  homepageUrl: 'https://uriparser.github.io/' as const,
  githubUrl: 'https://github.com/uriparser/uriparser' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install uriparser.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +uriparser.github.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install uriparser.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'uriparse',
  ] as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.0',
    '0.9.9',
    '0.9.8',
    '0.9.7',
    '0.9.6',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.6',
    '0.8.5',
  ] as const,
  aliases: [] as const,
}

export type UriparsergithubioPackage = typeof uriparsergithubioPackage
