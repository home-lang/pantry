/**
 * **xcodeproj** - Create and modify Xcode projects from Ruby.
 *
 * @domain `cocoapods.org/xcodeproj`
 * @programs `xcodeproj`
 * @version `1.27.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install cocoapods.org/xcodeproj`
 * @homepage https://cocoapods.org/
 * @dependencies `ruby-lang.org~3.2`, `rubygems.org^3`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cocoapodsorgxcodeproj
 * console.log(pkg.name)        // "xcodeproj"
 * console.log(pkg.description) // "Create and modify Xcode projects from Ruby."
 * console.log(pkg.programs)    // ["xcodeproj"]
 * console.log(pkg.versions[0]) // "1.27.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/cocoapods-org/xcodeproj.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install cocoapods.org/xcodeproj' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cocoapods.org/xcodeproj -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install cocoapods.org/xcodeproj' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.27.0',
    '1.26.0',
    '1.25.1',
    '1.25.0',
    '1.24.0',
    '1.23.0',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.0',
    '1.18.0',
    '1.17.1',
    '1.17.0',
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.1',
    '1.11.0',
    '1.10.0',
    '1.9.0',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.9',
    '1.5.8',
    '1.5.7',
    '1.5.6',
    '1.5.5',
    '1.5.4',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.3',
    '1.3.2',
    '0.20.1',
    '0.19.3',
    '0.19.2',
    '0.19.0',
    '0.15.3',
    '0.15.2',
  ] as const,
  aliases: [] as const,
}

export type CocoapodsorgxcodeprojPackage = typeof cocoapodsorgxcodeprojPackage
