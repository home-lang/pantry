/**
 * **eureka** - 💡 CLI tool to input and store your ideas without leaving the terminal
 *
 * @domain `crates.io/eureka`
 * @programs `eureka`
 * @version `2.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/eureka`
 * @dependencies `libgit2.org~1.7 # links to libgit2.so.1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioeureka
 * console.log(pkg.name)        // "eureka"
 * console.log(pkg.description) // "💡 CLI tool to input and store your ideas witho..."
 * console.log(pkg.programs)    // ["eureka"]
 * console.log(pkg.versions[0]) // "2.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/eureka.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioeurekaPackage = {
  /**
   * The display name of this package.
   */
  name: 'eureka' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/eureka' as const,
  /**
   * Brief description of what this package does.
   */
  description: '💡 CLI tool to input and store your ideas without leaving the terminal' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/eureka/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/simeg/eureka' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/eureka' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/eureka -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/eureka' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'eureka',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioeurekaPackage = typeof cratesioeurekaPackage
