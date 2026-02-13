/**
 * **fastlane** - 🚀 The easiest way to automate building and releasing your iOS and Android apps
 *
 * @domain `fastlane.tools`
 * @programs `fastlane`
 * @version `2.231.1` (28 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fastlane.tools`
 * @homepage https://fastlane.tools
 * @dependencies `ruby-lang.org~3.2`, `rubygems.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fastlanetools
 * console.log(pkg.name)        // "fastlane"
 * console.log(pkg.description) // "🚀 The easiest way to automate building and rel..."
 * console.log(pkg.programs)    // ["fastlane"]
 * console.log(pkg.versions[0]) // "2.231.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fastlane-tools.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fastlanetoolsPackage = {
  /**
   * The display name of this package.
   */
  name: 'fastlane' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fastlane.tools' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🚀 The easiest way to automate building and releasing your iOS and Android apps' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fastlane.tools/package.yml' as const,
  homepageUrl: 'https://fastlane.tools' as const,
  githubUrl: 'https://github.com/fastlane/fastlane' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fastlane.tools' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fastlane.tools -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fastlane.tools' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fastlane',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'ruby-lang.org~3.2',
    'rubygems.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.231.1',
    '2.231.0',
    '2.230.0',
    '2.229.1',
    '2.229.0',
    '2.228.0',
    '2.227.2',
    '2.227.1',
    '2.227.0',
    '2.226.0',
    '2.225.0',
    '2.224.0',
    '2.223.1',
    '2.223.0',
    '2.222.0',
    '2.221.1',
    '2.221.0',
    '2.220.0',
    '2.219.0',
    '2.218.0',
    '2.217.0',
    '2.216.0',
    '2.215.1',
    '2.215.0',
    '2.214.0',
    '2.213.0',
    '2.212.2',
    '2.212.1',
  ] as const,
  aliases: [] as const,
}

export type FastlanetoolsPackage = typeof fastlanetoolsPackage
