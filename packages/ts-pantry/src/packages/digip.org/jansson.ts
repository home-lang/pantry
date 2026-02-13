/**
 * **jansson** - C library for encoding, decoding and manipulating JSON data
 *
 * @domain `digip.org/jansson`
 * @version `2.14.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install digip.org/jansson`
 * @homepage http://www.digip.org/jansson/
 * @buildDependencies `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.digiporgjansson
 * console.log(pkg.name)        // "jansson"
 * console.log(pkg.description) // "C library for encoding, decoding and manipulati..."
 * console.log(pkg.versions[0]) // "2.14.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/digip-org/jansson.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const digiporgjanssonPackage = {
  /**
   * The display name of this package.
   */
  name: 'jansson' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'digip.org/jansson' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'C library for encoding, decoding and manipulating JSON data' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/digip.org/jansson/package.yml' as const,
  homepageUrl: 'http://www.digip.org/jansson/' as const,
  githubUrl: 'https://github.com/akheron/jansson' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install digip.org/jansson' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +digip.org/jansson -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install digip.org/jansson' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.14.1',
    '2.14.0',
  ] as const,
  aliases: [] as const,
}

export type DigiporgjanssonPackage = typeof digiporgjanssonPackage
