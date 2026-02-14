/**
 * **asciidoctor** - :gem: A fast, open source text processor and publishing toolchain, written in Ruby, for converting AsciiDoc content to HTML 5, DocBook 5, and other formats.
 *
 * @domain `asciidoctor.org`
 * @programs `asciidoctor`
 * @version `2.0.26` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install asciidoctor.org`
 * @homepage https://asciidoctor.org/
 * @dependencies `ruby-lang.org^3.1`, `rubygems.org`
 * @buildDependencies `rubygems.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.asciidoctororg
 * console.log(pkg.name)        // "asciidoctor"
 * console.log(pkg.description) // ":gem: A fast, open source text processor and pu..."
 * console.log(pkg.programs)    // ["asciidoctor"]
 * console.log(pkg.versions[0]) // "2.0.26" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/asciidoctor-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const asciidoctororgPackage = {
  /**
  * The display name of this package.
  */
  name: 'asciidoctor' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'asciidoctor.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: ':gem: A fast, open source text processor and publishing toolchain, written in Ruby, for converting AsciiDoc content to HTML 5, DocBook 5, and other formats.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/asciidoctor.org/package.yml' as const,
  homepageUrl: 'https://asciidoctor.org/' as const,
  githubUrl: 'https://github.com/asciidoctor/asciidoctor' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install asciidoctor.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +asciidoctor.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install asciidoctor.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'asciidoctor',
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.0.26',
    '2.0.25',
    '2.0.24',
    '2.0.23',
    '2.0.22',
    '2.0.21',
    '2.0.20',
    '2.0.19',
    '2.0.18',
  ] as const,
  aliases: [] as const,
}

export type AsciidoctororgPackage = typeof asciidoctororgPackage
