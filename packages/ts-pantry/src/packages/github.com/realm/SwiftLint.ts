/**
 * **swiftlint** - A tool to enforce Swift style and conventions.
 *
 * @domain `github.com/realm/SwiftLint`
 * @programs `swiftlint`
 * @version `0.63.1` (24 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/realm/SwiftLint`
 * @homepage https://realm.github.io/SwiftLint
 * @dependencies `linux:curl.se@8`, `linux:gnome.org/libxml2@2` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomrealmswiftlint
 * console.log(pkg.name)        // "swiftlint"
 * console.log(pkg.description) // "A tool to enforce Swift style and conventions."
 * console.log(pkg.programs)    // ["swiftlint"]
 * console.log(pkg.versions[0]) // "0.63.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/realm/SwiftLint.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const swiftlintPackage = {
  /**
   * The display name of this package.
   */
  name: 'swiftlint' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/realm/SwiftLint' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool to enforce Swift style and conventions.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/realm/SwiftLint/package.yml' as const,
  homepageUrl: 'https://realm.github.io/SwiftLint' as const,
  githubUrl: 'https://github.com/realm/SwiftLint' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/realm/SwiftLint' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/realm/SwiftLint -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/realm/SwiftLint' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'swiftlint',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:curl.se@8',
    'linux:gnome.org/libxml2@2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.63.1',
    '0.63.0',
    '0.62.2',
    '0.62.1',
    '0.62.0',
    '0.61.0',
    '0.60.0',
    '0.59.1',
    '0.59.0',
    '0.58.2',
    '0.58.1',
    '0.58.0',
    '0.57.1',
    '0.57.0',
    '0.56.2',
    '0.56.1',
    '0.56.0',
    '0.55.1',
    '0.55.0',
    '0.54.0',
    '0.53.0',
    '0.52.4',
    '0.52.3',
    '0.52.2',
  ] as const,
  aliases: [] as const,
}

export type SwiftlintPackage = typeof swiftlintPackage
