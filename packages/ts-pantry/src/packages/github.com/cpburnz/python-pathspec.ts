/**
 * **python-pathspec** - Utility library for gitignore style pattern matching of file paths.
 *
 * @domain `github.com/cpburnz/python-pathspec`
 * @version `1.0.3` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/cpburnz/python-pathspec`
 * @dependencies `python.org~3.11`
 * @buildDependencies `flit.pypa.io` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcpburnzpythonpathspec
 * console.log(pkg.name)        // "python-pathspec"
 * console.log(pkg.description) // "Utility library for gitignore style pattern mat..."
 * console.log(pkg.versions[0]) // "1.0.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/cpburnz/python-pathspec.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pythonpathspecPackage = {
  /**
   * The display name of this package.
   */
  name: 'python-pathspec' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/cpburnz/python-pathspec' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Utility library for gitignore style pattern matching of file paths.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cpburnz/python-pathspec/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/cpburnz/python-pathspec' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/cpburnz/python-pathspec' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/cpburnz/python-pathspec -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/cpburnz/python-pathspec' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'flit.pypa.io',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.12.1',
  ] as const,
  aliases: [] as const,
}

export type PythonpathspecPackage = typeof pythonpathspecPackage
