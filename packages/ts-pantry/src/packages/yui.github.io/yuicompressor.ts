/**
 * **yuicompressor** - Yahoo! JavaScript and CSS compressor
 *
 * @domain `yui.github.io/yuicompressor`
 * @programs `yuicompressor`
 * @version `2.4.8` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install yui.github.io/yuicompressor`
 * @homepage https://yui.github.io/yuicompressor/
 * @dependencies `openjdk.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.yuigithubioyuicompressor
 * console.log(pkg.name)        // "yuicompressor"
 * console.log(pkg.description) // "Yahoo! JavaScript and CSS compressor"
 * console.log(pkg.programs)    // ["yuicompressor"]
 * console.log(pkg.versions[0]) // "2.4.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/yui-github-io/yuicompressor.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const yuigithubioyuicompressorPackage = {
  /**
   * The display name of this package.
   */
  name: 'yuicompressor' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'yui.github.io/yuicompressor' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Yahoo! JavaScript and CSS compressor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/yui.github.io/yuicompressor/package.yml' as const,
  homepageUrl: 'https://yui.github.io/yuicompressor/' as const,
  githubUrl: 'https://github.com/yui/yuicompressor' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install yui.github.io/yuicompressor' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +yui.github.io/yuicompressor -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install yui.github.io/yuicompressor' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'yuicompressor',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openjdk.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.8',
  ] as const,
  aliases: [] as const,
}

export type YuigithubioyuicompressorPackage = typeof yuigithubioyuicompressorPackage
