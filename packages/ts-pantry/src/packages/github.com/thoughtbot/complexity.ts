/**
 * **complexity** - A command line tool to identify complex code
 *
 * @domain `github.com/thoughtbot/complexity`
 * @programs `complexity`
 * @version `0.4.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/thoughtbot/complexity`
 * @homepage https://www.gnu.org/software/complexity/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomthoughtbotcomplexity
 * console.log(pkg.name)        // "complexity"
 * console.log(pkg.description) // "A command line tool to identify complex code"
 * console.log(pkg.programs)    // ["complexity"]
 * console.log(pkg.versions[0]) // "0.4.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/thoughtbot/complexity.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const complexityPackage = {
  /**
  * The display name of this package.
  */
  name: 'complexity' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/thoughtbot/complexity' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A command line tool to identify complex code' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/thoughtbot/complexity/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/complexity/' as const,
  githubUrl: 'https://github.com/thoughtbot/complexity' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/thoughtbot/complexity' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/thoughtbot/complexity -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/thoughtbot/complexity' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'complexity',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.2',
  ] as const,
  aliases: [] as const,
}

export type ComplexityPackage = typeof complexityPackage
