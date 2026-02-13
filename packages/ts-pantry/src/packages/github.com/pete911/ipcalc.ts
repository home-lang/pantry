/**
 * **ipcalc** - pkgx package
 *
 * @domain `github.com/pete911/ipcalc`
 * @version `1.0.4` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/pete911/ipcalc`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompete911ipcalc
 * console.log(pkg.name)        // "ipcalc"
 * console.log(pkg.versions[0]) // "1.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/pete911/ipcalc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ipcalcPackage = {
  /**
   * The display name of this package.
   */
  name: 'ipcalc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/pete911/ipcalc' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pete911/ipcalc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/pete911/ipcalc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/pete911/ipcalc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/pete911/ipcalc' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.4',
    '1.0.3',
  ] as const,
  aliases: [] as const,
}

export type IpcalcPackage = typeof ipcalcPackage
