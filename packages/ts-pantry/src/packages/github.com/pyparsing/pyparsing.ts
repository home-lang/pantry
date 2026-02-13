/**
 * **pyparsing** - Python library for creating PEG parsers
 *
 * @domain `github.com/pyparsing/pyparsing`
 * @version `3.3.2` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/pyparsing/pyparsing`
 * @dependencies `python.org~3.11`
 * @buildDependencies `flit.pypa.io` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompyparsingpyparsing
 * console.log(pkg.name)        // "pyparsing"
 * console.log(pkg.description) // "Python library for creating PEG parsers"
 * console.log(pkg.versions[0]) // "3.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/pyparsing/pyparsing.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pyparsingPackage = {
  /**
   * The display name of this package.
   */
  name: 'pyparsing' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/pyparsing/pyparsing' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Python library for creating PEG parsers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pyparsing/pyparsing/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/pyparsing/pyparsing' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/pyparsing/pyparsing' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/pyparsing/pyparsing -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/pyparsing/pyparsing' as const,
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
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.5',
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.4',
    '3.1.3',
    '3.1.2',
    '3.1.1',
  ] as const,
  aliases: [] as const,
}

export type PyparsingPackage = typeof pyparsingPackage
