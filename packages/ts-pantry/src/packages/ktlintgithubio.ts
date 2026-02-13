/**
 * **ktlint** - An anti-bikeshedding Kotlin linter with built-in formatter
 *
 * @domain `ktlint.github.io`
 * @programs `ktlint`
 * @version `1.8.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ktlint.github.io`
 * @homepage https://ktlint.github.io/
 * @dependencies `openjdk.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ktlintgithubio
 * console.log(pkg.name)        // "ktlint"
 * console.log(pkg.description) // "An anti-bikeshedding Kotlin linter with built-i..."
 * console.log(pkg.programs)    // ["ktlint"]
 * console.log(pkg.versions[0]) // "1.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ktlint-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ktlintgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'ktlint' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'ktlint.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An anti-bikeshedding Kotlin linter with built-in formatter' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ktlint.github.io/package.yml' as const,
  homepageUrl: 'https://ktlint.github.io/' as const,
  githubUrl: 'https://github.com/pinterest/ktlint' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install ktlint.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ktlint.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ktlint.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ktlint',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openjdk.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.8.0',
    '1.7.1',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.1',
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.1',
    '0.49.1',
  ] as const,
  aliases: [] as const,
}

export type KtlintgithubioPackage = typeof ktlintgithubioPackage
