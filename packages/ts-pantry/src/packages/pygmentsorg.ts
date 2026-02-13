/**
 * **pygmentize** - Pygments is a generic syntax highlighter written in Python
 *
 * @domain `pygments.org`
 * @programs `pygmentize`
 * @version `2.19.2` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pygments.org`
 * @homepage https://pygments.org/
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pygmentsorg
 * console.log(pkg.name)        // "pygmentize"
 * console.log(pkg.description) // "Pygments is a generic syntax highlighter writte..."
 * console.log(pkg.programs)    // ["pygmentize"]
 * console.log(pkg.versions[0]) // "2.19.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pygments-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pygmentsorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'pygmentize' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pygments.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Pygments is a generic syntax highlighter written in Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pygments.org/package.yml' as const,
  homepageUrl: 'https://pygments.org/' as const,
  githubUrl: 'https://github.com/pygments/pygments' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pygments.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pygments.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pygments.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pygmentize',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.19.2',
    '2.19.1',
    '2.19.0',
    '2.18.0',
    '2.17.2',
    '2.17.1',
    '2.17.0',
    '2.15.0',
    '2.14.0',
  ] as const,
  aliases: [] as const,
}

export type PygmentsorgPackage = typeof pygmentsorgPackage
