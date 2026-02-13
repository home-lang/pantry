/**
 * **sing-box** - The universal proxy platform
 *
 * @domain `sing-box.app`
 * @programs `sing-box`
 * @version `1.12.17` (71 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sing-box.app`
 * @homepage https://sing-box.sagernet.org
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.singboxapp
 * console.log(pkg.name)        // "sing-box"
 * console.log(pkg.description) // "The universal proxy platform"
 * console.log(pkg.programs)    // ["sing-box"]
 * console.log(pkg.versions[0]) // "1.12.17" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sing-box-app.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const singboxappPackage = {
  /**
   * The display name of this package.
   */
  name: 'sing-box' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sing-box.app' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The universal proxy platform' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sing-box.app/package.yml' as const,
  homepageUrl: 'https://sing-box.sagernet.org' as const,
  githubUrl: 'https://github.com/SagerNet/sing-box' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sing-box.app' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sing-box.app -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sing-box.app' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sing-box',
  ] as const,
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
    '1.12.17',
    '1.12.16',
    '1.12.15',
    '1.12.14',
    '1.12.13',
    '1.12.12',
    '1.12.11',
    '1.12.10',
    '1.12.9',
    '1.12.8',
    '1.12.7',
    '1.12.6',
    '1.12.5',
    '1.12.4',
    '1.12.3',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.15',
    '1.11.14',
    '1.11.13',
    '1.11.12',
    '1.11.11',
    '1.11.10',
    '1.11.9',
    '1.11.8',
    '1.11.7',
    '1.11.6',
    '1.11.5',
    '1.11.4',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.7',
    '1.10.6',
    '1.10.5',
    '1.10.4',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.7',
    '1.9.6',
    '1.9.5',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.14',
    '1.8.13',
    '1.8.12',
    '1.8.11',
    '1.8.10',
    '1.8.9',
    '1.8.8',
    '1.8.7',
    '1.8.6',
    '1.8.5',
    '1.8.4',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.8',
    '1.7.7',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.3',
    '1.7.2',
  ] as const,
  aliases: [] as const,
}

export type SingboxappPackage = typeof singboxappPackage
