/**
 * **poetry** - Python packaging and dependency management made easy
 *
 * @domain `python-poetry.org`
 * @programs `poetry`
 * @version `2.3.1` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install python-poetry.org`
 * @homepage https://python-poetry.org/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.11`, `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pythonpoetryorg
 * console.log(pkg.name)        // "poetry"
 * console.log(pkg.description) // "Python packaging and dependency management made..."
 * console.log(pkg.programs)    // ["poetry"]
 * console.log(pkg.versions[0]) // "2.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/python-poetry-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pythonpoetryorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'poetry' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'python-poetry.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Python packaging and dependency management made easy' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/python-poetry.org/package.yml' as const,
  homepageUrl: 'https://python-poetry.org/' as const,
  githubUrl: 'https://github.com/python-poetry/poetry' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install python-poetry.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +python-poetry.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install python-poetry.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'poetry',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.11',
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.1',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.4',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.1',
    '2.0.0',
    '1.8.5',
    '1.8.4',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.1',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.1',
    '1.5.0',
    '1.4.2',
    '1.4.0',
    '1.3.2',
  ] as const,
  aliases: [] as const,
}

export type PythonpoetryorgPackage = typeof pythonpoetryorgPackage
