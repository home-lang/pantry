/**
 * **libfyaml** - pkgx package
 *
 * @domain `github.com/pantoniou/libfyaml`
 * @version `0.9.3` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/pantoniou/libfyaml`
 * @buildDependencies `linux:gnu.org/m4` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompantonioulibfyaml
 * console.log(pkg.name)        // "libfyaml"
 * console.log(pkg.versions[0]) // "0.9.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/pantoniou/libfyaml.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libfyamlPackage = {
  /**
   * The display name of this package.
   */
  name: 'libfyaml' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/pantoniou/libfyaml' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pantoniou/libfyaml/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/pantoniou/libfyaml' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/pantoniou/libfyaml -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/pantoniou/libfyaml' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/m4',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type LibfyamlPackage = typeof libfyamlPackage
