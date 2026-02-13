/**
 * **openresty** - High Performance Web Platform Based on Nginx and LuaJIT
 *
 * @domain `openresty.org`
 * @programs `nginx-xml2pod`, `opm`, `resty`, `restydoc`, `restydoc-index`
 * @version `1.27.1.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openresty.org`
 * @homepage https://openresty.org
 * @dependencies `pcre.org@8`, `openssl.org^1.1`, `zlib.net^1.2`, ... (+1 more)
 * @buildDependencies `waterlan.home.xs4all.nl/dos2unix`, `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openrestyorg
 * console.log(pkg.name)        // "openresty"
 * console.log(pkg.description) // "High Performance Web Platform Based on Nginx an..."
 * console.log(pkg.programs)    // ["nginx-xml2pod", "opm", ...]
 * console.log(pkg.versions[0]) // "1.27.1.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openresty-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openrestyorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'openresty' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openresty.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'High Performance Web Platform Based on Nginx and LuaJIT' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openresty.org/package.yml' as const,
  homepageUrl: 'https://openresty.org' as const,
  githubUrl: 'https://github.com/openresty/openresty' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openresty.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openresty.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openresty.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nginx-xml2pod',
    'opm',
    'resty',
    'restydoc',
    'restydoc-index',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pcre.org@8',
    'openssl.org^1.1',
    'zlib.net^1.2',
    'perl.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'waterlan.home.xs4all.nl/dos2unix',
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.27.1.2',
    '1.27.1.1',
    '1.25.3.2',
  ] as const,
  aliases: [] as const,
}

export type OpenrestyorgPackage = typeof openrestyorgPackage
