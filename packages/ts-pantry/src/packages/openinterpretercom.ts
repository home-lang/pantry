/**
 * **open-interpreter** - A natural language interface for computers
 *
 * @domain `openinterpreter.com`
 * @programs `interpreter`
 * @version `0.4.0` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openinterpreter.com`
 * @homepage http://openinterpreter.com/
 * @dependencies `python.org>=3.10<3.12`, `github.com/mattrobenolt/jinja2-cli`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openinterpretercom
 * console.log(pkg.name)        // "open-interpreter"
 * console.log(pkg.description) // "A natural language interface for computers"
 * console.log(pkg.programs)    // ["interpreter"]
 * console.log(pkg.versions[0]) // "0.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openinterpreter-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openinterpretercomPackage = {
  /**
   * The display name of this package.
   */
  name: 'open-interpreter' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openinterpreter.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A natural language interface for computers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openinterpreter.com/package.yml' as const,
  homepageUrl: 'http://openinterpreter.com/' as const,
  githubUrl: 'https://github.com/KillianLucas/open-interpreter' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openinterpreter.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openinterpreter.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openinterpreter.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'interpreter',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.10<3.12',
    'github.com/mattrobenolt/jinja2-cli',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.0',
    '0.2.1',
    '0.2.0',
    '0.1.18',
    '0.1.17',
    '0.1.16',
    '0.1.15',
    '0.1.14',
    '0.1.13',
    '0.1.12',
    '0.1.11',
    '0.1.9',
    '0.1.8',
    '0.1.7',
    '0.1.6',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.1.0',
    '0.0.297',
  ] as const,
  aliases: [] as const,
}

export type OpeninterpretercomPackage = typeof openinterpretercomPackage
