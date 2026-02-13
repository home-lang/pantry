/**
 * **swift-outdated** - A swift subcommand for displaying when your dependencies (SwiftPM or Xcode) are out of date
 *
 * @domain `github.com/kiliankoe/swift-outdated`
 * @programs `swift-outdated`
 * @version `0.11.0` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/kiliankoe/swift-outdated`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkiliankoeswiftoutdated
 * console.log(pkg.name)        // "swift-outdated"
 * console.log(pkg.description) // "A swift subcommand for displaying when your dep..."
 * console.log(pkg.programs)    // ["swift-outdated"]
 * console.log(pkg.versions[0]) // "0.11.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/kiliankoe/swift-outdated.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const swiftoutdatedPackage = {
  /**
   * The display name of this package.
   */
  name: 'swift-outdated' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/kiliankoe/swift-outdated' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A swift subcommand for displaying when your dependencies (SwiftPM or Xcode) are out of date' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kiliankoe/swift-outdated/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kiliankoe/swift-outdated' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/kiliankoe/swift-outdated' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kiliankoe/swift-outdated -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/kiliankoe/swift-outdated' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'swift-outdated',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.1',
    '0.8.0',
    '0.7.0',
    '0.6.0',
    '0.5.1',
  ] as const,
  aliases: [] as const,
}

export type SwiftoutdatedPackage = typeof swiftoutdatedPackage
