/**
 * **xcodeproj** - Create and modify Xcode projects from Ruby.
 *
 * @domain `cocoapods.org/xcodeproj`
 * @programs `xcodeproj`
 * @version `1.27.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cocoapods.org/xcodeproj`
 * @homepage https://cocoapods.org/
 * @dependencies `ruby-lang.org~3.2`, `rubygems.org^3`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cocoapodsorgxcodeproj
 * console.log(pkg.name)        // "xcodeproj"
 * console.log(pkg.description) // "Create and modify Xcode projects from Ruby."
 * console.log(pkg.programs)    // ["xcodeproj"]
 * console.log(pkg.versions[0]) // "1.27.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cocoapods-org/xcodeproj.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cocoapodsorgxcodeprojPackage = {
  /**
   * The display name of this package.
   */
  name: 'xcodeproj' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cocoapods.org/xcodeproj' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Create and modify Xcode projects from Ruby.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cocoapods.org/xcodeproj/package.yml' as const,
  homepageUrl: 'https://cocoapods.org/' as const,
  githubUrl: 'https://github.com/CocoaPods/Xcodeproj' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cocoapods.org/xcodeproj' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cocoapods.org/xcodeproj -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cocoapods.org/xcodeproj' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xcodeproj',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'ruby-lang.org~3.2',
    'rubygems.org^3',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.27.0',
  ] as const,
  aliases: [] as const,
}

export type CocoapodsorgxcodeprojPackage = typeof cocoapodsorgxcodeprojPackage
