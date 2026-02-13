/**
 * **scala-lang** - The Scala 3 compiler, also known as Dotty.
 *
 * @domain `scala-lang.org`
 * @programs `scalac`, `scala`, `scala-cli`, `sbtn`, `amm`
 * @version `3.8.1` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install scala-lang.org`
 * @homepage https://dotty.epfl.ch
 * @dependencies `openjdk.org`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.scalalangorg
 * console.log(pkg.name)        // "scala-lang"
 * console.log(pkg.description) // "The Scala 3 compiler, also known as Dotty."
 * console.log(pkg.programs)    // ["scalac", "scala", ...]
 * console.log(pkg.versions[0]) // "3.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/scala-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const scalalangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'scala-lang' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'scala-lang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Scala 3 compiler, also known as Dotty.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/scala-lang.org/package.yml' as const,
  homepageUrl: 'https://dotty.epfl.ch' as const,
  githubUrl: 'https://github.com/scala/scala3' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install scala-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +scala-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install scala-lang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'scalac',
    'scala',
    'scala-cli',
    'sbtn',
    'amm',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openjdk.org',
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
    '3.8.1',
    '3.8.0',
    '3.7.4',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.4',
    '3.6.3',
    '3.6.2',
    '3.5.2',
    '3.5.1',
    '3.3.7',
    '3.3.6',
    '3.3.5',
  ] as const,
  aliases: [] as const,
}

export type ScalalangorgPackage = typeof scalalangorgPackage
