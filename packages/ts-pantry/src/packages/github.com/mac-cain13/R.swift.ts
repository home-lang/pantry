/**
 * **rswift** - Strong typed, autocompleted resources like images, fonts and segues in Swift projects
 *
 * @domain `github.com/mac-cain13/R.swift`
 * @programs `rswift`
 * @version `7.8.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/mac-cain13/R.swift`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcommaccain13rswift
 * console.log(pkg.name)        // "rswift"
 * console.log(pkg.description) // "Strong typed, autocompleted resources like imag..."
 * console.log(pkg.programs)    // ["rswift"]
 * console.log(pkg.versions[0]) // "7.8.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/mac-cain13/R-swift.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/mac-cain13/R.swift' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mac-cain13/R.swift -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/mac-cain13/R.swift' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '7.8.0',
    '7.7.0',
    '7.6.1',
    '7.6.0',
    '7.5.0',
    '7.4.0',
    '7.3.2',
    '7.3.0',
    '7.2.4',
    '7.2.3',
    '7.2.2',
    '7.2.1',
    '7.2.0',
    '7.1.0',
    '7.0.1',
    '7.0.0',
    '6.1.0',
    '6.0.0',
    '5.4.0',
    '5.3.1',
    '5.3.0',
    '5.2.2',
    '5.2.1',
    '5.2.0',
    '5.1.0',
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0.0',
  ] as const,
  aliases: [] as const,
}

export type RswiftPackage = typeof rswiftPackage
