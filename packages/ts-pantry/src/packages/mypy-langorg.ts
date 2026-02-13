/**
 * **mypy-lang** - Experimental optional static type checker for Python
 *
 * @domain `mypy-lang.org`
 * @programs `mypy`, `mypyc`, `dmypy`
 * @version `1.19.1` (31 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mypy-lang.org`
 * @homepage https://www.mypy-lang.org/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mypylangorg
 * console.log(pkg.name)        // "mypy-lang"
 * console.log(pkg.description) // "Experimental optional static type checker for P..."
 * console.log(pkg.programs)    // ["mypy", "mypyc", ...]
 * console.log(pkg.versions[0]) // "1.19.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mypy-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mypylangorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'mypy-lang' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mypy-lang.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Experimental optional static type checker for Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mypy-lang.org/package.yml' as const,
  homepageUrl: 'https://www.mypy-lang.org/' as const,
  githubUrl: 'https://github.com/python/mypy' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mypy-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mypy-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mypy-lang.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mypy',
    'mypyc',
    'dmypy',
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
    'python.org@>=3<3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.19.1',
    '1.19.0',
    '1.18.2',
    '1.18.1',
    '1.17.1',
    '1.17.0',
    '1.16.1',
    '1.16.0',
    '1.15.0',
    '1.14.1',
    '1.14.0',
    '1.13.0',
    '1.12.1',
    '1.12.0',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.1',
    '1.10.0',
    '1.9.0',
    '1.8.0',
    '1.7.1',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.1',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.0',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type MypylangorgPackage = typeof mypylangorgPackage
