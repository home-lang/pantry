/**
 * **rubygems** - Powerful, clean, object-oriented scripting language
 *
 * @domain `rubygems.org`
 * @programs `bundle`, `bundler`, `gem`
 * @version `4.0.4` (65 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rubygems.org`
 * @homepage https://www.ruby-lang.org/
 * @dependencies `ruby-lang.org>=2.3`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rubygemsorg
 * console.log(pkg.name)        // "rubygems"
 * console.log(pkg.description) // "Powerful, clean, object-oriented scripting lang..."
 * console.log(pkg.programs)    // ["bundle", "bundler", ...]
 * console.log(pkg.versions[0]) // "4.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rubygems-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rubygemsorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'rubygems' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rubygems.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Powerful, clean, object-oriented scripting language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rubygems.org/package.yml' as const,
  homepageUrl: 'https://www.ruby-lang.org/' as const,
  githubUrl: 'https://github.com/ruby/ruby' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rubygems.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rubygems.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rubygems.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bundle',
    'bundler',
    'gem',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'ruby-lang.org>=2.3',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.9',
    '3.6.8',
    '3.6.7',
    '3.6.6',
    '3.6.5',
    '3.6.4',
    '3.6.3',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.23',
    '3.5.22',
    '3.5.21',
    '3.5.20',
    '3.5.19',
    '3.5.18',
    '3.5.17',
    '3.5.16',
    '3.5.15',
    '3.5.14',
    '3.5.13',
    '3.5.12',
    '3.5.11',
    '3.5.10',
    '3.5.9',
    '3.5.8',
    '3.5.7',
    '3.5.6',
    '3.5.5',
    '3.5.4',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.22',
    '3.4.21',
    '3.4.20',
    '3.4.19',
    '3.4.18',
    '3.4.17',
    '3.4.16',
    '3.4.15',
    '3.4.14',
    '3.4.13',
    '3.4.10',
    '3.4.9',
    '3.4.7',
    '3.4.6',
    '3.4.5',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.27',
    '3.3.26',
    '3.3.25',
    '3.2.34',
  ] as const,
  aliases: [] as const,
}

export type RubygemsorgPackage = typeof rubygemsorgPackage
