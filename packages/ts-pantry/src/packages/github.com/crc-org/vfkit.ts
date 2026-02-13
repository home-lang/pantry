/**
 * **vfkit** - pkgx package
 *
 * @domain `github.com/crc-org/vfkit`
 * @programs `vfkit`
 * @version `0.6.3` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/crc-org/vfkit`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcrcorgvfkit
 * console.log(pkg.name)        // "vfkit"
 * console.log(pkg.programs)    // ["vfkit"]
 * console.log(pkg.versions[0]) // "0.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/crc-org/vfkit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const vfkitPackage = {
  /**
   * The display name of this package.
   */
  name: 'vfkit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/crc-org/vfkit' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/crc-org/vfkit/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/crc-org/vfkit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/crc-org/vfkit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/crc-org/vfkit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/crc-org/vfkit' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'vfkit',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.1',
  ] as const,
  aliases: [] as const,
}

export type VfkitPackage = typeof vfkitPackage
