/**
 * **sip** - Tool to create Python bindings for C and C++ libraries
 *
 * @domain `riverbankcomputing.com/sip`
 * @programs `sip-install`, `sip-build`, `sip-distinfo`, `sip-module`, `sip-sdist`, ... (+1 more)
 * @version `6.8.3` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install riverbankcomputing.com/sip`
 * @homepage https://python-sip.readthedocs.io/en/latest/
 * @dependencies `python.org~3.11`, `llvm.org<17 # needs gcc to sip-install`
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.riverbankcomputingcomsip
 * console.log(pkg.name)        // "sip"
 * console.log(pkg.description) // "Tool to create Python bindings for C and C++ li..."
 * console.log(pkg.programs)    // ["sip-install", "sip-build", ...]
 * console.log(pkg.versions[0]) // "6.8.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/riverbankcomputing-com/sip.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const riverbankcomputingcomsipPackage = {
  /**
  * The display name of this package.
  */
  name: 'sip' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'riverbankcomputing.com/sip' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tool to create Python bindings for C and C++ libraries' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/riverbankcomputing.com/sip/package.yml' as const,
  homepageUrl: 'https://python-sip.readthedocs.io/en/latest/' as const,
  githubUrl: 'https://github.com/Python-SIP/sip' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install riverbankcomputing.com/sip' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +riverbankcomputing.com/sip -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install riverbankcomputing.com/sip' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sip-install',
    'sip-build',
    'sip-distinfo',
    'sip-module',
    'sip-sdist',
    'sip-wheel',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.11',
    'llvm.org<17 # needs gcc to sip-install',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.8.3',
    '6.8.2',
    '6.8.1',
    '6.8.0',
    '6.7.11',
    '6.7.0',
  ] as const,
  aliases: [] as const,
}

export type RiverbankcomputingcomsipPackage = typeof riverbankcomputingcomsipPackage
