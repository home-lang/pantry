/**
 * **rswift** - Strong typed, autocompleted resources like images, fonts and segues in Swift projects
 *
 * @domain `github.com/mac-cain13/R.swift`
 * @programs `rswift`
 * @version `7.8.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mac-cain13/R.swift`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommaccain13rswift
 * console.log(pkg.name)        // "rswift"
 * console.log(pkg.description) // "Strong typed, autocompleted resources like imag..."
 * console.log(pkg.programs)    // ["rswift"]
 * console.log(pkg.versions[0]) // "7.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mac-cain13/R-swift.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rswiftPackage = {
  /**
   * The display name of this package.
   */
  name: 'rswift' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mac-cain13/R.swift' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Strong typed, autocompleted resources like images, fonts and segues in Swift projects' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mac-cain13/R.swift/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mac-cain13/R.swift' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mac-cain13/R.swift' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mac-cain13/R.swift -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mac-cain13/R.swift' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rswift',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.8.0',
    '7.7.0',
    '7.6.1',
    '7.6.0',
    '7.5.0',
    '7.4.0',
    '7.3.2',
  ] as const,
  aliases: [] as const,
}

export type RswiftPackage = typeof rswiftPackage
