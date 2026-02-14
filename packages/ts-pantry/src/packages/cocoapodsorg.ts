/**
 * **pod** - Dependency manager for Cocoa projects
 *
 * @domain `cocoapods.org`
 * @programs `pod`
 * @version `1.16.2` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cocoapods.org`
 * @homepage https://cocoapods.org/
 * @dependencies `ruby-lang.org~3.2`, `sourceware.org/libffi^3`, `rubygems.org^3`, ... (+1 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cocoapodsorg
 * console.log(pkg.name)        // "pod"
 * console.log(pkg.description) // "Dependency manager for Cocoa projects"
 * console.log(pkg.programs)    // ["pod"]
 * console.log(pkg.versions[0]) // "1.16.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cocoapods-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cocoapodsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'pod' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cocoapods.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Dependency manager for Cocoa projects' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cocoapods.org/package.yml' as const,
  homepageUrl: 'https://cocoapods.org/' as const,
  githubUrl: 'https://github.com/CocoaPods/CocoaPods' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install cocoapods.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cocoapods.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cocoapods.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pod',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'ruby-lang.org~3.2',
    'sourceware.org/libffi^3',
    'rubygems.org^3',
    'git-scm.org^2',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.16.2',
    '1.16.1',
    '1.16.0',
    '1.15.2',
    '1.15.1',
    '1.15.0',
    '1.14.3',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.0',
    '1.12.1',
    '1.5.0',
  ] as const,
  aliases: [] as const,
}

export type CocoapodsorgPackage = typeof cocoapodsorgPackage
