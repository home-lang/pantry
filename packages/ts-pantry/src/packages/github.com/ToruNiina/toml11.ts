/**
 * **toml11** - pkgx package
 *
 * @domain `github.com/ToruNiina/toml11`
 * @version `4.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/ToruNiina/toml11`
 * @buildDependencies `cmake.org@>=3.1`, `linux:gnu.org/gcc@^14` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomtoruniinatoml11
 * console.log(pkg.name)        // "toml11"
 * console.log(pkg.versions[0]) // "4.4.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/ToruNiina/toml11.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const toml11Package = {
  /**
  * The display name of this package.
  */
  name: 'toml11' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/ToruNiina/toml11' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ToruNiina/toml11/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/ToruNiina/toml11' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ToruNiina/toml11 -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/ToruNiina/toml11' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org@>=3.1',
    'linux:gnu.org/gcc@^14',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.4.0',
  ] as const,
  aliases: [] as const,
}

export type Toml11Package = typeof toml11Package
