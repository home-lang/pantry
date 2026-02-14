/**
 * **tabulate** - Pretty-print tabular data in Python, a library and a command-line utility. Repository migrated from bitbucket.org/astanin/python-tabulate.
 *
 * @domain `github.com/astanin/python-tabulate`
 * @programs `tabulate`
 * @version `0.9.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/astanin/python-tabulate`
 * @homepage https://pypi.org/project/tabulate/
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@>=3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomastaninpythontabulate
 * console.log(pkg.name)        // "tabulate"
 * console.log(pkg.description) // "Pretty-print tabular data in Python, a library ..."
 * console.log(pkg.programs)    // ["tabulate"]
 * console.log(pkg.versions[0]) // "0.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/astanin/python-tabulate.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pythontabulatePackage = {
  /**
  * The display name of this package.
  */
  name: 'tabulate' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/astanin/python-tabulate' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Pretty-print tabular data in Python, a library and a command-line utility. Repository migrated from bitbucket.org/astanin/python-tabulate.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/astanin/python-tabulate/package.yml' as const,
  homepageUrl: 'https://pypi.org/project/tabulate/' as const,
  githubUrl: 'https://github.com/astanin/python-tabulate' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/astanin/python-tabulate' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/astanin/python-tabulate -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/astanin/python-tabulate' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tabulate',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@>=3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type PythontabulatePackage = typeof pythontabulatePackage
