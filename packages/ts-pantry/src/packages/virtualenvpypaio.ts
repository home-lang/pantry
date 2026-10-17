/**
 * **virtualenv** - Tool for creating isolated virtual python environments
 *
 * @domain `virtualenv.pypa.io`
 * @programs `virtualenv`
 * @version `21.14.9` (110 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install virtualenv.pypa.io`
 * @homepage https://virtualenv.pypa.io/
 * @dependencies `pkgx.sh>=1`, `libexpat.github.io^2`, `openssl.org^1.1`
 * @buildDependencies `python.org@>=3.7<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.virtualenvpypaio
 * console.log(pkg.name)        // "virtualenv"
 * console.log(pkg.description) // "Tool for creating isolated virtual python envir..."
 * console.log(pkg.programs)    // ["virtualenv"]
 * console.log(pkg.versions[0]) // "21.14.9" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/virtualenv-pypa-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const virtualenvpypaioPackage = {
  /**
  * The display name of this package.
  */
  name: 'virtualenv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'virtualenv.pypa.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tool for creating isolated virtual python environments' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/virtualenv.pypa.io/package.yml' as const,
  homepageUrl: 'https://virtualenv.pypa.io/' as const,
  githubUrl: 'https://github.com/pypa/virtualenv' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install virtualenv.pypa.io' as const,
  pantryInstallCommand: 'pantry install virtualenv.pypa.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'virtualenv',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
    'libexpat.github.io^2',
    'openssl.org^1.1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@>=3.7<3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '21.14.9',
    '21.14.8',
    '21.14.7',
    '21.14.6',
    '21.14.5',
    '21.14.4',
    '21.14.3',
    '21.14.2',
    '21.14.1',
    '21.14.0',
    '21.13.0',
    '21.12.1',
    '21.12.0',
    '21.11.1',
    '21.11.0',
    '21.10.0',
    '21.9.1',
    '21.9.0',
    '21.8.1',
    '21.7.16',
    '21.7.15',
    '21.7.14',
    '21.7.13',
    '21.7.12',
    '21.7.11',
    '21.7.10',
    '21.7.9',
    '21.7.8',
    '21.7.7',
    '21.7.6',
    '21.7.5',
    '21.7.4',
    '21.7.3',
    '21.7.2',
    '21.7.1',
    '21.7.0',
    '21.6.1',
    '21.6.0',
    '21.5.2',
    '21.5.1',
    '21.5.0',
    '21.4.3',
    '21.4.2',
    '21.4.1',
    '21.4.0',
    '21.3.3',
    '21.3.2',
    '21.3.1',
    '21.3.0',
    '21.2.4',
    '21.2.3',
    '21.2.2',
    '21.2.1',
    '21.2.0',
    '21.1.0',
    '21.0.0',
    '20.39.1',
    '20.39.0',
    '20.38.0',
    '20.36.1',
    '20.36.0',
    '20.35.4',
    '20.35.3',
    '20.35.2',
    '20.35.1',
    '20.35.0',
    '20.34.0',
    '20.33.1',
    '20.33.0',
    '20.32.0',
    '20.31.2',
    '20.31.1',
    '20.31.0',
    '20.30.0',
    '20.29.3',
    '20.29.2',
    '20.29.1',
    '20.29.0',
    '20.28.1',
    '20.28.0',
    '20.27.2',
    '20.27.1',
    '20.27.0',
    '20.26.6',
    '20.26.5',
    '20.26.4',
    '20.26.3',
    '20.26.2',
    '20.26.1',
    '20.26.0',
    '20.25.3',
    '20.25.2',
    '20.25.1',
    '20.25.0',
    '20.24.7',
    '20.24.6',
    '20.24.5',
    '20.24.4',
    '20.24.3',
    '20.24.2',
    '20.24.1',
    '20.24.0',
    '20.23.1',
    '20.23.0',
    '20.22.0',
    '20.21.1',
    '20.21.0',
    '20.20.0',
    '20.19.0',
    '20.18.0',
  ] as const,
  aliases: [] as const,
}

export type VirtualenvpypaioPackage = typeof virtualenvpypaioPackage
