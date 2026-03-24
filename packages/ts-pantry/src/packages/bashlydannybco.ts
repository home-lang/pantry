/**
 * **bashly** - Bash command line framework and CLI generator
 *
 * @domain `bashly.dannyb.co`
 * @programs `bashly`
 * @version `1.3.8` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install bashly.dannyb.co`
 * @homepage https://bashly.dev
 * @dependencies `ruby-lang.org^3.1`, `rubygems.org`
 * @buildDependencies `rubygems.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.bashlydannybco
 * console.log(pkg.name)        // "bashly"
 * console.log(pkg.description) // "Bash command line framework and CLI generator"
 * console.log(pkg.programs)    // ["bashly"]
 * console.log(pkg.versions[0]) // "1.3.8" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/bashly-dannyb-co.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const bashlydannybcoPackage = {
  /**
  * The display name of this package.
  */
  name: 'bashly' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'bashly.dannyb.co' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Bash command line framework and CLI generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/bashly.dannyb.co/package.yml' as const,
  homepageUrl: 'https://bashly.dev' as const,
  githubUrl: 'https://github.com/DannyBen/bashly' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install bashly.dannyb.co' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bashly.dannyb.co -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install bashly.dannyb.co' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bashly',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'ruby-lang.org^3.1',
    'rubygems.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'rubygems.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.8',
    '1.3.7',
    '1.3.6',
    '1.3.5',
    '1.3.4',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.2.13',
    '1.2.12',
    '1.2.11',
    '1.2.10',
    '1.2.9',
    '1.2.8',
    '1.2.7',
    '1.2.6',
    '1.2.5',
    '1.2.4',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.10',
    '1.1.9',
    '1.1.8',
    '1.1.7',
    '1.1.6',
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.8',
    '1.0.7',
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.10',
    '0.8.9',
  ] as const,
  aliases: [] as const,
}

export type BashlydannybcoPackage = typeof bashlydannybcoPackage
