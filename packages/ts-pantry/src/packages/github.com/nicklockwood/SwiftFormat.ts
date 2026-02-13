/**
 * **swiftformat** - A command-line tool and Xcode Extension for formatting Swift code
 *
 * @domain `github.com/nicklockwood/SwiftFormat`
 * @programs `swiftformat`
 * @version `0.58.7` (56 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/nicklockwood/SwiftFormat`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnicklockwoodswiftformat
 * console.log(pkg.name)        // "swiftformat"
 * console.log(pkg.description) // "A command-line tool and Xcode Extension for for..."
 * console.log(pkg.programs)    // ["swiftformat"]
 * console.log(pkg.versions[0]) // "0.58.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/nicklockwood/SwiftFormat.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const swiftformatPackage = {
  /**
   * The display name of this package.
   */
  name: 'swiftformat' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/nicklockwood/SwiftFormat' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A command-line tool and Xcode Extension for formatting Swift code' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nicklockwood/SwiftFormat/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/nicklockwood/SwiftFormat' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/nicklockwood/SwiftFormat' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nicklockwood/SwiftFormat -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/nicklockwood/SwiftFormat' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'swiftformat',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.58.7',
    '0.58.6',
    '0.58.5',
    '0.58.4',
    '0.58.3',
    '0.58.2',
    '0.58.1',
    '0.58.0',
    '0.57.2',
    '0.57.1',
    '0.57.0',
    '0.56.4',
    '0.56.3',
    '0.56.2',
    '0.56.1',
    '0.56.0',
    '0.55.6',
    '0.55.5',
    '0.55.4',
    '0.55.3',
    '0.55.2',
    '0.55.1',
    '0.55.0',
    '0.54.6',
    '0.54.5',
    '0.54.4',
    '0.54.3',
    '0.54.2',
    '0.54.1',
    '0.54.0',
    '0.53.10',
    '0.53.9',
    '0.53.8',
    '0.53.7',
    '0.53.6',
    '0.53.5',
    '0.53.4',
    '0.53.3',
    '0.53.2',
    '0.53.1',
    '0.53.0',
    '0.52.11',
    '0.52.10',
    '0.52.9',
    '0.52.8',
    '0.52.7',
    '0.52.6',
    '0.52.5',
    '0.52.4',
    '0.52.3',
    '0.52.2',
    '0.52.1',
    '0.52.0',
    '0.51.14',
    '0.51.13',
    '0.51.12',
  ] as const,
  aliases: [] as const,
}

export type SwiftformatPackage = typeof swiftformatPackage
