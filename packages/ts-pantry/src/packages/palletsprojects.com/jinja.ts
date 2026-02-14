/**
 * **python-jinja** - A very fast and expressive template engine.
 *
 * @domain `palletsprojects.com/jinja`
 * @version `3.1.6` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install palletsprojects.com/jinja`
 * @homepage https://jinja.palletsprojects.com
 * @dependencies `python.org>=3.11`, `markupsafe.palletsprojects.com>=2.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.palletsprojectscomjinja
 * console.log(pkg.name)        // "python-jinja"
 * console.log(pkg.description) // "A very fast and expressive template engine."
 * console.log(pkg.versions[0]) // "3.1.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/palletsprojects-com/jinja.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const palletsprojectscomjinjaPackage = {
  /**
  * The display name of this package.
  */
  name: 'python-jinja' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'palletsprojects.com/jinja' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A very fast and expressive template engine.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/palletsprojects.com/jinja/package.yml' as const,
  homepageUrl: 'https://jinja.palletsprojects.com' as const,
  githubUrl: 'https://github.com/pallets/jinja' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install palletsprojects.com/jinja' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +palletsprojects.com/jinja -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install palletsprojects.com/jinja' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org>=3.11',
    'markupsafe.palletsprojects.com>=2.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.1.6',
    '3.1.5',
    '3.1.4',
    '3.1.3',
  ] as const,
  aliases: [] as const,
}

export type PalletsprojectscomjinjaPackage = typeof palletsprojectscomjinjaPackage
