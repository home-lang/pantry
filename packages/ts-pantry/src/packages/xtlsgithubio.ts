/**
 * **xray-core** - Xray, Penetrates Everything. Also the best v2ray-core, with XTLS support. Fully compatible configuration.
 *
 * @domain `xtls.github.io`
 * @programs `xray`
 * @version `26.2.6` (49 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install xtls.github.io`
 * @homepage https://xtls.github.io/
 * @buildDependencies `go.dev@^1.21.4`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.xtlsgithubio
 * console.log(pkg.name)        // "xray-core"
 * console.log(pkg.description) // "Xray, Penetrates Everything. Also the best v2ra..."
 * console.log(pkg.programs)    // ["xray"]
 * console.log(pkg.versions[0]) // "26.2.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/xtls-github-io.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install xtls.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xtls.github.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install xtls.github.io' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '26.2.6',
    '26.2.4',
    '26.2.2',
    '26.1.31',
    '26.1.23',
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
  ] as const,
  aliases: [] as const,
}

export type XtlsgithubioPackage = typeof xtlsgithubioPackage
