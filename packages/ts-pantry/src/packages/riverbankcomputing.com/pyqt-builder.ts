/**
 * **pyqt-bundle** - The PyQt build system
 *
 * @domain `riverbankcomputing.com/pyqt-builder`
 * @programs `pyqt-bundle`
 * @version `1.15.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install riverbankcomputing.com/pyqt-builder`
 * @homepage https://pyqt-builder.readthedocs.io/
 * @dependencies `python.org~3.11`, `riverbankcomputing.com/sip`
 * @buildDependencies `llvm.org@<17`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.riverbankcomputingcompyqtbuilder
 * console.log(pkg.name)        // "pyqt-bundle"
 * console.log(pkg.description) // "The PyQt build system"
 * console.log(pkg.programs)    // ["pyqt-bundle"]
 * console.log(pkg.versions[0]) // "1.15.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/riverbankcomputing-com/pyqt-builder.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const riverbankcomputingcompyqtbuilderPackage = {
  /**
  * The display name of this package.
  */
  name: 'pyqt-bundle' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'riverbankcomputing.com/pyqt-builder' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The PyQt build system' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/riverbankcomputing.com/pyqt-builder/package.yml' as const,
  homepageUrl: 'https://pyqt-builder.readthedocs.io/' as const,
  githubUrl: 'https://github.com/Python-PyQt/PyQt-builder' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install riverbankcomputing.com/pyqt-builder' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +riverbankcomputing.com/pyqt-builder -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install riverbankcomputing.com/pyqt-builder' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pyqt-bundle',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
    'riverbankcomputing.com/sip',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'llvm.org@<17',
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.15.4',
    '1.15.3',
    '1.15.2',
  ] as const,
  aliases: [] as const,
}

export type RiverbankcomputingcompyqtbuilderPackage = typeof riverbankcomputingcompyqtbuilderPackage
