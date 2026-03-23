/**
 * **json.nlohmann.me** - pkgx package
 *
 * @domain `json.nlohmann.me`
 * @version `3.12.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install json.nlohmann.me`
 * @buildDependencies `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.jsonnlohmannme
 * console.log(pkg.name)        // "json.nlohmann.me"
 * console.log(pkg.versions[0]) // "3.12.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/json-nlohmann-me.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const jsonnlohmannmePackage = {
  /**
  * The display name of this package.
  */
  name: 'json.nlohmann.me' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'json.nlohmann.me' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/json.nlohmann.me/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install json.nlohmann.me' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +json.nlohmann.me -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install json.nlohmann.me' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.12.0',
    '3.11.3',
    '3.11.2',
    '3.11.1',
    '3.11.0',
    '3.10.5',
    '3.10.4',
    '3.10.3',
    '3.10.2',
    '3.10.1',
    '3.10.0',
    '3.9.1',
    '3.9.0',
    '3.8.0',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.1',
    '3.6.0',
  ] as const,
  aliases: [] as const,
}

export type JsonnlohmannmePackage = typeof jsonnlohmannmePackage
