/**
 * **yj** - CLI - Convert between YAML, TOML, JSON, and HCL. Preserves map order.
 *
 * @domain `github.com/sclevine/yj`
 * @programs `yj`
 * @version `5.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/sclevine/yj`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsclevineyj
 * console.log(pkg.name)        // "yj"
 * console.log(pkg.description) // "CLI - Convert between YAML, TOML, JSON, and HCL..."
 * console.log(pkg.programs)    // ["yj"]
 * console.log(pkg.versions[0]) // "5.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/sclevine/yj.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const yjPackage = {
  /**
   * The display name of this package.
   */
  name: 'yj' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/sclevine/yj' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI - Convert between YAML, TOML, JSON, and HCL. Preserves map order.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/sclevine/yj/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sclevine/yj' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/sclevine/yj' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/sclevine/yj -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/sclevine/yj' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'yj',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.1.0',
  ] as const,
  aliases: [] as const,
}

export type YjPackage = typeof yjPackage
