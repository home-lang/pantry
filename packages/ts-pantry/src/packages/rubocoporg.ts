/**
 * **rubocop** - A Ruby static code analyzer and formatter, based on the community Ruby style guide.
 *
 * @domain `rubocop.org`
 * @programs `rubocop`
 * @version `1.82.1` (41 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rubocop.org`
 * @homepage https://docs.rubocop.org
 * @dependencies `ruby-lang.org>=3.1<3.3.7`, `rubygems.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rubocoporg
 * console.log(pkg.name)        // "rubocop"
 * console.log(pkg.description) // "A Ruby static code analyzer and formatter, base..."
 * console.log(pkg.programs)    // ["rubocop"]
 * console.log(pkg.versions[0]) // "1.82.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rubocop-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rubocoporgPackage = {
  /**
   * The display name of this package.
   */
  name: 'rubocop' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rubocop.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A Ruby static code analyzer and formatter, based on the community Ruby style guide.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rubocop.org/package.yml' as const,
  homepageUrl: 'https://docs.rubocop.org' as const,
  githubUrl: 'https://github.com/rubocop/rubocop' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rubocop.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rubocop.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rubocop.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rubocop',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'ruby-lang.org>=3.1<3.3.7',
    'rubygems.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.82.1',
    '1.82.0',
    '1.81.7',
    '1.81.6',
    '1.81.1',
    '1.81.0',
    '1.80.2',
    '1.80.1',
    '1.80.0',
    '1.79.2',
    '1.79.1',
    '1.79.0',
    '1.78.0',
    '1.77.0',
    '1.76.2',
    '1.76.1',
    '1.76.0',
    '1.75.8',
    '1.75.7',
    '1.75.6',
    '1.75.5',
    '1.75.4',
    '1.75.3',
    '1.75.2',
    '1.75.1',
    '1.75.0',
    '1.74.0',
    '1.73.2',
    '1.73.1',
    '1.73.0',
    '1.72.2',
    '1.72.1',
    '1.72.0',
    '1.71.2',
    '1.71.1',
    '1.71.0',
    '1.70.0',
    '1.69.2',
    '1.69.1',
    '1.69.0',
    '1.68.0',
  ] as const,
  aliases: [] as const,
}

export type RubocoporgPackage = typeof rubocoporgPackage
