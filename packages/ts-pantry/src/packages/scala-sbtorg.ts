/**
 * **sbt** - sbt, the interactive build tool
 *
 * @domain `scala-sbt.org`
 * @programs `sbt`
 * @version `1.12.0` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install scala-sbt.org`
 * @homepage https://www.scala-sbt.org/
 * @dependencies `openjdk.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.scalasbtorg
 * console.log(pkg.name)        // "sbt"
 * console.log(pkg.description) // "sbt, the interactive build tool"
 * console.log(pkg.programs)    // ["sbt"]
 * console.log(pkg.versions[0]) // "1.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/scala-sbt-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const scalasbtorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'sbt' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'scala-sbt.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'sbt, the interactive build tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/scala-sbt.org/package.yml' as const,
  homepageUrl: 'https://www.scala-sbt.org/' as const,
  githubUrl: 'https://github.com/sbt/sbt' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install scala-sbt.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +scala-sbt.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install scala-sbt.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sbt',
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
    '1.12.0',
    '1.11.7',
    '1.11.6',
    '1.11.5',
    '1.11.4',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.11',
    '1.10.10',
    '1.10.9',
    '1.10.7',
    '1.10.6',
    '1.10.5',
    '1.10.4',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.9',
    '1.9.8',
    '1.9.7',
    '1.9.6',
    '1.9.5',
    '1.9.4',
    '1.9.3',
  ] as const,
  aliases: [] as const,
}

export type ScalasbtorgPackage = typeof scalasbtorgPackage
