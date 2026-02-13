/**
 * **pytest** - The pytest framework makes it easy to write small tests, yet scales to support complex functional testing
 *
 * @domain `pytest.org`
 * @programs `pytest`
 * @version `9.0.2` (31 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pytest.org`
 * @homepage https://docs.pytest.org/en/latest/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@>=3.7<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pytestorg
 * console.log(pkg.name)        // "pytest"
 * console.log(pkg.description) // "The pytest framework makes it easy to write sma..."
 * console.log(pkg.programs)    // ["pytest"]
 * console.log(pkg.versions[0]) // "9.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pytest-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pytestorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'pytest' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pytest.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The pytest framework makes it easy to write small tests, yet scales to support complex functional testing' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pytest.org/package.yml' as const,
  homepageUrl: 'https://docs.pytest.org/en/latest/' as const,
  githubUrl: 'https://github.com/pytest-dev/pytest' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pytest.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pytest.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pytest.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pytest',
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
    'python.org@>=3.7<3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '9.0.2',
    '9.0.1',
    '9.0.0',
    '8.4.2',
    '8.4.1',
    '8.4.0',
    '8.3.5',
    '8.3.4',
    '8.3.3',
    '8.3.2',
    '8.3.1',
    '8.3.0',
    '8.2.2',
    '8.2.1',
    '8.2.0',
    '8.1.2',
    '8.1.1',
    '8.1.0',
    '8.0.2',
    '8.0.1',
    '8.0.0',
    '7.4.4',
    '7.4.3',
    '7.4.2',
    '7.4.1',
    '7.4.0',
    '7.3.2',
    '7.3.1',
    '7.3.0',
    '7.2.2',
    '7.1.0',
  ] as const,
  aliases: [] as const,
}

export type PytestorgPackage = typeof pytestorgPackage
