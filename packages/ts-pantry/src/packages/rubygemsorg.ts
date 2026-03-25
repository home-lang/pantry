/**
 * **rubygems** - Powerful, clean, object-oriented scripting language
 *
 * @domain `rubygems.org`
 * @programs `bundle`, `bundler`, `gem`
 * @version `4.0.8` (69 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install rubygems.org`
 * @homepage https://www.ruby-lang.org/
 * @dependencies `ruby-lang.org>=2.3`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.rubygemsorg
 * console.log(pkg.name)        // "rubygems"
 * console.log(pkg.description) // "Powerful, clean, object-oriented scripting lang..."
 * console.log(pkg.programs)    // ["bundle", "bundler", ...]
 * console.log(pkg.versions[0]) // "4.0.8" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/rubygems-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install rubygems.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rubygems.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install rubygems.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.0.9',
    '4.0.8',
    '4.0.7',
    '4.0.6',
    '4.0.5',
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
    'bundler-v2.7.2',
    'bundler-v2.7.1',
    'bundler-v2.7.0',
    'bundler-v2.6.9',
    'bundler-v2.6.8',
    'bundler-v2.6.7',
    'bundler-v2.6.6',
    'bundler-v2.6.5',
    'bundler-v2.6.4',
    'bundler-v2.6.3',
    'bundler-v2.6.2',
    'bundler-v2.6.1',
    'bundler-v2.6.0',
    'bundler-v2.5.23',
    'bundler-v4.0.8',
    'bundler-v4.0.7',
    'bundler-v4.0.6',
    'bundler-v4.0.5',
    'bundler-v4.0.4',
    'bundler-v4.0.3',
    'bundler-v4.0.2',
    'bundler-v4.0.1',
    'bundler-v4.0.0',
  ] as const,
  aliases: [] as const,
}

export type RubygemsorgPackage = typeof rubygemsorgPackage
