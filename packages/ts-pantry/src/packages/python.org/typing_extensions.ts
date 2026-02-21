/**
 * **typing_extensions** - Backported and experimental type hints for Python
 *
 * @domain `python.org/typing_extensions`
 * @version `4.15.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install python.org/typing_extensions`
 * @buildDependencies `flit.pypa.io`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pythonorgtyping_extensions
 * console.log(pkg.name)        // "typing_extensions"
 * console.log(pkg.description) // "Backported and experimental type hints for Python"
 * console.log(pkg.versions[0]) // "4.15.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/python-org/typing_extensions.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pythonorgtyping_extensionsPackage = {
  /**
  * The display name of this package.
  */
  name: 'typing_extensions' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'python.org/typing_extensions' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Backported and experimental type hints for Python' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/python.org/typing_extensions/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/python/typing_extensions' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install python.org/typing_extensions' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +python.org/typing_extensions -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install python.org/typing_extensions' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'flit.pypa.io',
    'python.org@~3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.15.0',
    '4.14.1',
    '4.14.0',
    '4.13.2',
    '4.13.1',
    '4.13.0',
    '4.12.2',
    '4.12.1',
    '4.12.0',
    '4.11.0',
    '4.10.0',
    '4.9.0',
    '4.8.0',
  ] as const,
  aliases: [] as const,
}

export type Pythonorgtyping_extensionsPackage = typeof pythonorgtyping_extensionsPackage
