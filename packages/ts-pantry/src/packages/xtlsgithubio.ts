/**
 * **xray-core** - Xray, Penetrates Everything. Also the best v2ray-core, with XTLS support. Fully compatible configuration.
 *
 * @domain `xtls.github.io`
 * @programs `xray`
 * @version `26.1.18` (44 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xtls.github.io`
 * @homepage https://xtls.github.io/
 * @buildDependencies `go.dev@^1.21.4`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xtlsgithubio
 * console.log(pkg.name)        // "xray-core"
 * console.log(pkg.description) // "Xray, Penetrates Everything. Also the best v2ra..."
 * console.log(pkg.programs)    // ["xray"]
 * console.log(pkg.versions[0]) // "26.1.18" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xtls-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xtlsgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'xray-core' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'xtls.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Xray, Penetrates Everything. Also the best v2ray-core, with XTLS support. Fully compatible configuration.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xtls.github.io/package.yml' as const,
  homepageUrl: 'https://xtls.github.io/' as const,
  githubUrl: 'https://github.com/XTLS/Xray-core' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install xtls.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xtls.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xtls.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xray',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21.4',
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '26.1.18',
    '26.1.13',
    '25.12.8',
    '25.12.2',
    '25.12.1',
    '25.10.15',
    '25.9.11',
    '25.9.10',
    '25.9.5',
    '25.8.31',
    '25.8.3',
    '25.7.26',
    '25.7.25',
    '25.6.8',
    '25.5.16',
    '25.4.30',
    '25.3.6',
    '25.2.21',
    '25.1.30',
    '24.12.31',
    '24.12.18',
    '24.11.30',
    '24.11.21',
    '24.11.11',
    '24.11.5',
    '24.10.31',
    '24.9.30',
    '1.8.24',
    '1.8.23',
    '1.8.21',
    '1.8.20',
    '1.8.19',
    '1.8.18',
    '1.8.17',
    '1.8.16',
    '1.8.15',
    '1.8.13',
    '1.8.12',
    '1.8.11',
    '1.8.10',
    '1.8.9',
    '1.8.8',
    '1.8.7',
    '1.8.6',
  ] as const,
  aliases: [] as const,
}

export type XtlsgithubioPackage = typeof xtlsgithubioPackage
