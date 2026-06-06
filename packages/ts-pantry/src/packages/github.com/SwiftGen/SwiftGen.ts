/**
 * **swiftgen** - The Swift code generator for your assets, storyboards, Localizable.strings, … — Get rid of all String-based APIs!
 *
 * @domain `github.com/SwiftGen/SwiftGen`
 * @programs `swiftgen`
 * @version `6.6.3` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/SwiftGen/SwiftGen`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomswiftgenswiftgen
 * console.log(pkg.name)        // "swiftgen"
 * console.log(pkg.description) // "The Swift code generator for your assets, story..."
 * console.log(pkg.programs)    // ["swiftgen"]
 * console.log(pkg.versions[0]) // "6.6.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/SwiftGen/SwiftGen.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/SwiftGen/SwiftGen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/SwiftGen/SwiftGen -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/SwiftGen/SwiftGen' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '6.6.3',
    '6.6.2',
    '6.6.1',
    '6.6.0',
    '6.5.1',
    '6.5.0',
    '6.4.0',
    '6.3.0',
    '6.2.1',
    '6.2.0',
    '6.1.0',
    '6.0.2',
    '6.0.1',
    '6.0.0',
    '5.3.0',
    '5.2.1',
    '5.2.0',
    '5.1.2',
    '5.1.1',
    '5.1.0',
    '5.0.0',
    '4.2.1',
    '4.2.0',
    '4.1.0',
    '4.0.1',
    '4.0.0',
    '3.0.1',
    '3.0.0',
    '2.0.0',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.0',
    '0.8.0',
    '0.7.6',
    '0.7.5',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.0',
    '0.5.2',
    '0.5.1',
  ] as const,
  aliases: [] as const,
}

export type SwiftgenPackage = typeof swiftgenPackage
