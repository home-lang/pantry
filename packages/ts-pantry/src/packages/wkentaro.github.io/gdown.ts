/**
 * **gdown** - Google Drive Public File Downloader when Curl/Wget Fails
 *
 * @domain `wkentaro.github.io/gdown`
 * @programs `gdown`
 * @version `5.2.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install wkentaro.github.io/gdown`
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.wkentarogithubiogdown
 * console.log(pkg.name)        // "gdown"
 * console.log(pkg.description) // "Google Drive Public File Downloader when Curl/W..."
 * console.log(pkg.programs)    // ["gdown"]
 * console.log(pkg.versions[0]) // "5.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/wkentaro-github-io/gdown.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const wkentarogithubiogdownPackage = {
  /**
   * The display name of this package.
   */
  name: 'gdown' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'wkentaro.github.io/gdown' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Google Drive Public File Downloader when Curl/Wget Fails' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/wkentaro.github.io/gdown/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/wkentaro/gdown' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install wkentaro.github.io/gdown' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +wkentaro.github.io/gdown -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install wkentaro.github.io/gdown' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gdown',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.2.1',
    '5.2.0',
    '5.1.0',
    '5.0.1',
    '5.0.0',
    '4.7.3',
    '4.7.2',
    '4.7.1',
  ] as const,
  aliases: [] as const,
}

export type WkentarogithubiogdownPackage = typeof wkentarogithubiogdownPackage
