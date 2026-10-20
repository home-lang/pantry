/**
 * **pip** - The Python package installer
 *
 * @domain `pip.pypa.io`
 * @programs `pip`, `pip3.8`, `pip3.9`, `pip3.10`, `pip3.11`
 * @version `26.2.2` (116 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pip.pypa.io`
 * @homepage https://pip.pypa.io/
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.11`, `crates.io/semverator@^0.4.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.pippypaio
 * console.log(pkg.name)        // "pip"
 * console.log(pkg.description) // "The Python package installer"
 * console.log(pkg.programs)    // ["pip", "pip3.8", ...]
 * console.log(pkg.versions[0]) // "26.2.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/pip-pypa-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const pippypaioPackage = {
  /**
  * The display name of this package.
  */
  name: 'pip' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pip.pypa.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The Python package installer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pip.pypa.io/package.yml' as const,
  homepageUrl: 'https://pip.pypa.io/' as const,
  githubUrl: 'https://github.com/pypa/pip' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pip.pypa.io' as const,
  pantryInstallCommand: 'pantry install pip.pypa.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pip',
    'pip3.8',
    'pip3.9',
    'pip3.10',
    'pip3.11',
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
    'python.org@~3.11',
    'crates.io/semverator@^0.4.3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '26.2.2',
    '26.2.1',
    '26.2',
    '26.1.2',
    '26.1.1',
    '26.1',
    '26.0.1',
    '26.0',
    '26.0.0',
    '25.3',
    '25.3.0',
    '25.2',
    '25.2.0',
    '25.1.1',
    '25.1',
    '25.1.0',
    '25.0.1',
    '25.0',
    '25.0.0',
    '24.3.1',
    '24.3',
    '24.3.0',
    '24.2',
    '24.2.0',
    '24.1.2',
    '24.1.1',
    '24.1',
    '24.1b2',
    '24.1b1',
    '24.1.0',
    '24.0',
    '24.0.0',
    '23.3.2',
    '23.3.1',
    '23.3',
    '23.3.0',
    '23.2.1',
    '23.2',
    '23.2.0',
    '23.1.2',
    '23.1.1',
    '23.1',
    '23.1.0',
    '23.0.1',
    '23.0',
    '23.0.0',
    '22.3.1',
    '22.3',
    '22.3.0',
    '22.2.2',
    '22.2.1',
    '22.2',
    '22.1.2',
    '22.1.1',
    '22.1',
    '22.1b1',
    '22.0.4',
    '22.0.3',
    '22.0.2',
    '22.0.1',
    '22.0',
    '21.3.1',
    '21.3',
    '21.2.4',
    '21.2.3',
    '21.2.2',
    '21.2.1',
    '21.2',
    '21.1.3',
    '21.1.2',
    '21.1.1',
    '21.1',
    '21.0.1',
    '21.0',
    '20.3.4',
    '20.3.3',
    '20.3.2',
    '20.3.1',
    '20.3',
    '20.3b1',
    '20.2.4',
    '20.2.3',
    '20.2.2',
    '20.2.1',
    '20.2',
    '20.2b1',
    '20.1.1',
    '20.1',
    '20.1b1',
    '20.0.2',
    '20.0.1',
    '20.0',
    '19.3.1',
    '19.3',
    '19.2.3',
    '19.2.2',
    '19.2.1',
    '19.2',
    '19.1.1',
    '19.1',
    '19.0.3',
    '19.0.2',
    '19.0.1',
    '19.0',
    '18.1',
    '18.1.0',
    '18.0',
    '10.0.1',
    '10.0.0',
    '10.0.0b2',
    '10.0.0b1',
    '9.0.3',
    '9.0.2',
    '9.0.1',
    '9.0.0',
    '8.1.2',
  ] as const,
  aliases: [] as const,
}

export type PippypaioPackage = typeof pippypaioPackage
