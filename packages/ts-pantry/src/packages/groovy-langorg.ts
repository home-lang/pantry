/**
 * **groovy-lang** - pkgx package
 *
 * @domain `groovy-lang.org`
 * @programs `grape`, `grape_completion`, `groovy`, `groovyc`, `groovyc_completion`, ... (+9 more)
 * @version `5.0.4` (30 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install groovy-lang.org`
 * @dependencies `openjdk.org@17`
 * @buildDependencies `waterlan.home.xs4all.nl/dos2unix` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.groovylangorg
 * console.log(pkg.name)        // "groovy-lang"
 * console.log(pkg.programs)    // ["grape", "grape_completion", ...]
 * console.log(pkg.versions[0]) // "5.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/groovy-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const groovylangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'groovy-lang' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'groovy-lang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/groovy-lang.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install groovy-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +groovy-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install groovy-lang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'grape',
    'grape_completion',
    'groovy',
    'groovyc',
    'groovyc_completion',
    'groovy_completion',
    'groovyConsole',
    'groovyConsole_completion',
    'groovydoc',
    'groovydoc_completion',
    'groovysh',
    'groovysh_completion',
    'java2groovy',
    'startGroovy',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openjdk.org@17',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'waterlan.home.xs4all.nl/dos2unix',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.0.4',
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0.0',
    '4.0.30',
    '4.0.29',
    '4.0.28',
    '4.0.27',
    '4.0.26',
    '4.0.25',
    '4.0.24',
    '4.0.23',
    '4.0.22',
    '4.0.21',
    '4.0.20',
    '4.0.18',
    '4.0.17',
    '4.0.16',
    '4.0.15',
    '4.0.14',
    '4.0.13',
    '3.0.25',
    '3.0.24',
    '3.0.23',
    '3.0.22',
    '3.0.21',
    '3.0.20',
    '3.0.19',
    '2.5.23',
  ] as const,
  aliases: [] as const,
}

export type GroovylangorgPackage = typeof groovylangorgPackage
