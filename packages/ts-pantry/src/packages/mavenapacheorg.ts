/**
 * **maven** - Java-based project management
 *
 * @domain `maven.apache.org`
 * @programs `mvn`, `mvnDebug`, `mvnyjp`
 * @version `3.9.14` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install maven.apache.org`
 * @name `mvn`
 * @aliases `maven`
 * @homepage https://maven.apache.org/
 * @dependencies `openjdk.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.maven
 * // Or access via domain
 * const samePkg = pantry.mavenapacheorg
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "mvn"
 * console.log(pkg.description) // "Java-based project management"
 * console.log(pkg.programs)    // ["mvn", "mvnDebug", ...]
 * console.log(pkg.versions[0]) // "3.9.14" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/maven-apache-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const mavenPackage = {
  /**
  * The display name of this package.
  */
  name: 'mvn' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'maven.apache.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Java-based project management' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/maven.apache.org/package.yml' as const,
  homepageUrl: 'https://maven.apache.org/' as const,
  githubUrl: 'https://github.com/apache/maven' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install maven.apache.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +maven.apache.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install maven.apache.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mvn',
    'mvnDebug',
    'mvnyjp',
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.9.14',
    '3.9.13',
    '3.9.12',
    '3.9.11',
    '3.9.10',
    '3.9.9',
    '3.9.8',
    '3.9.7',
    '3.9.6',
    '3.9.5',
    '3.9.4',
    '3.9.3',
    '3.8.9',
    '3.8.7',
    '3.6.3',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'maven',
  ] as const,
}

export type MavenPackage = typeof mavenPackage
