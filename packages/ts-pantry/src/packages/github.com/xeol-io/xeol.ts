/**
 * **xeol** - A scanner for end-of-life (EOL) software and dependencies in container images, filesystems, and SBOMs
 *
 * @domain `github.com/xeol-io/xeol`
 * @programs `xeol`
 * @version `0.10.8` (21 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/xeol-io/xeol`
 * @homepage https://www.xeol.io/
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomxeolioxeol
 * console.log(pkg.name)        // "xeol"
 * console.log(pkg.description) // "A scanner for end-of-life (EOL) software and de..."
 * console.log(pkg.programs)    // ["xeol"]
 * console.log(pkg.versions[0]) // "0.10.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/xeol-io/xeol.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xeolPackage = {
  /**
   * The display name of this package.
   */
  name: 'xeol' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/xeol-io/xeol' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A scanner for end-of-life (EOL) software and dependencies in container images, filesystems, and SBOMs' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/xeol-io/xeol/package.yml' as const,
  homepageUrl: 'https://www.xeol.io/' as const,
  githubUrl: 'https://github.com/xeol-io/xeol' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/xeol-io/xeol' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/xeol-io/xeol -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/xeol-io/xeol' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xeol',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.10.8',
    '0.10.7',
    '0.10.6',
    '0.10.5',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.15',
    '0.9.14',
    '0.9.13',
    '0.9.12',
    '0.9.11',
    '0.9.10',
    '0.9.9',
    '0.9.8',
    '0.9.7',
    '0.9.6',
    '0.9.5',
    '0.9.4',
  ] as const,
  aliases: [] as const,
}

export type XeolPackage = typeof xeolPackage
