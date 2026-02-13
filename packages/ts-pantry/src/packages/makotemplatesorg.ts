/**
 * **mako-render** - Mako Templates for Python
 *
 * @domain `makotemplates.org`
 * @programs `mako-render`
 * @version `1.3.10` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install makotemplates.org`
 * @homepage https://www.makotemplates.org
 * @dependencies `python.org~3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.makotemplatesorg
 * console.log(pkg.name)        // "mako-render"
 * console.log(pkg.description) // "Mako Templates for Python"
 * console.log(pkg.programs)    // ["mako-render"]
 * console.log(pkg.versions[0]) // "1.3.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/makotemplates-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const makotemplatesorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'mako-render' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'makotemplates.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Mako Templates for Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/makotemplates.org/package.yml' as const,
  homepageUrl: 'https://www.makotemplates.org' as const,
  githubUrl: 'https://github.com/sqlalchemy/mako' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install makotemplates.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +makotemplates.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install makotemplates.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mako-render',
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
    '1.3.10',
    '1.3.9',
    '1.3.8',
    '1.3.7',
    '1.3.6',
    '1.3.5',
    '1.3.4',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.4',
  ] as const,
  aliases: [] as const,
}

export type MakotemplatesorgPackage = typeof makotemplatesorgPackage
