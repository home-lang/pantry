/**
 * **streamlink** - Streamlink is a CLI utility which pipes video streams from various services into a video player
 *
 * @domain `streamlink.github.io`
 * @programs `streamlink`
 * @version `8.1.2` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install streamlink.github.io`
 * @homepage https://streamlink.github.io/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.streamlinkgithubio
 * console.log(pkg.name)        // "streamlink"
 * console.log(pkg.description) // "Streamlink is a CLI utility which pipes video s..."
 * console.log(pkg.programs)    // ["streamlink"]
 * console.log(pkg.versions[0]) // "8.1.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/streamlink-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const streamlinkgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'streamlink' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'streamlink.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Streamlink is a CLI utility which pipes video streams from various services into a video player' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/streamlink.github.io/package.yml' as const,
  homepageUrl: 'https://streamlink.github.io/' as const,
  githubUrl: 'https://github.com/streamlink/streamlink' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install streamlink.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +streamlink.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install streamlink.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'streamlink',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.1.2',
    '8.1.1',
    '8.1.0',
    '8.0.0',
    '7.6.0',
    '7.5.0',
    '7.4.0',
    '7.3.0',
    '7.2.0',
    '7.1.3',
    '7.1.2',
    '7.1.1',
    '7.1.0',
    '7.0.0',
    '6.11.0',
    '6.10.0',
    '6.9.0',
    '6.8.3',
    '6.8.2',
    '6.8.1',
    '6.8.0',
    '6.7.4',
    '6.7.3',
    '6.7.2',
    '6.7.1',
    '6.7.0',
  ] as const,
  aliases: [] as const,
}

export type StreamlinkgithubioPackage = typeof streamlinkgithubioPackage
