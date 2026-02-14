/**
 * **swiftenv** - Swift Version Manager
 *
 * @domain `github.com/kylef/swiftenv`
 * @programs `swiftenv`
 * @version `1.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/kylef/swiftenv`
 * @homepage https://swiftenv.fuller.li/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkylefswiftenv
 * console.log(pkg.name)        // "swiftenv"
 * console.log(pkg.description) // "Swift Version Manager"
 * console.log(pkg.programs)    // ["swiftenv"]
 * console.log(pkg.versions[0]) // "1.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/kylef/swiftenv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const swiftenvPackage = {
  /**
  * The display name of this package.
  */
  name: 'swiftenv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/kylef/swiftenv' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Swift Version Manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kylef/swiftenv/package.yml' as const,
  homepageUrl: 'https://swiftenv.fuller.li/' as const,
  githubUrl: 'https://github.com/kylef/swiftenv' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/kylef/swiftenv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kylef/swiftenv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/kylef/swiftenv' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'swiftenv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.0',
  ] as const,
  aliases: [] as const,
}

export type SwiftenvPackage = typeof swiftenvPackage
