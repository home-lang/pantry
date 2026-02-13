/**
 * **python-click** - Python composable command line interface toolkit
 *
 * @domain `palletsprojects.com/click`
 * @version `8.3.1` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install palletsprojects.com/click`
 * @homepage https://click.palletsprojects.com
 * @dependencies `python.org>=3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.palletsprojectscomclick
 * console.log(pkg.name)        // "python-click"
 * console.log(pkg.description) // "Python composable command line interface toolkit"
 * console.log(pkg.versions[0]) // "8.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/palletsprojects-com/click.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const palletsprojectscomclickPackage = {
  /**
   * The display name of this package.
   */
  name: 'python-click' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'palletsprojects.com/click' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Python composable command line interface toolkit' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/palletsprojects.com/click/package.yml' as const,
  homepageUrl: 'https://click.palletsprojects.com' as const,
  githubUrl: 'https://github.com/pallets/click' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install palletsprojects.com/click' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +palletsprojects.com/click -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install palletsprojects.com/click' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.3.1',
    '8.3.0',
    '8.2.2',
    '8.2.1',
    '8.2.0',
    '8.1.8',
    '8.1.7',
  ] as const,
  aliases: [] as const,
}

export type PalletsprojectscomclickPackage = typeof palletsprojectscomclickPackage
