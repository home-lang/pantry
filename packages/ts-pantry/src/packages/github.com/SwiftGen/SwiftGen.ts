/**
 * **swiftgen** - The Swift code generator for your assets, storyboards, Localizable.strings, … — Get rid of all String-based APIs!
 *
 * @domain `github.com/SwiftGen/SwiftGen`
 * @programs `swiftgen`
 * @version `6.6.3` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/SwiftGen/SwiftGen`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomswiftgenswiftgen
 * console.log(pkg.name)        // "swiftgen"
 * console.log(pkg.description) // "The Swift code generator for your assets, story..."
 * console.log(pkg.programs)    // ["swiftgen"]
 * console.log(pkg.versions[0]) // "6.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/SwiftGen/SwiftGen.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const swiftgenPackage = {
  /**
  * The display name of this package.
  */
  name: 'swiftgen' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/SwiftGen/SwiftGen' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Swift code generator for your assets, storyboards, Localizable.strings, … — Get rid of all String-based APIs!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/SwiftGen/SwiftGen/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/SwiftGen/SwiftGen' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/SwiftGen/SwiftGen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/SwiftGen/SwiftGen -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/SwiftGen/SwiftGen' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'swiftgen',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.6.3',
    '6.6.2',
  ] as const,
  aliases: [] as const,
}

export type SwiftgenPackage = typeof swiftgenPackage
