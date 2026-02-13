/**
 * **tox** - Command line driven CI frontend and development task automation tool.
 *
 * @domain `tox.wiki`
 * @programs `tox`
 * @version `4.34.1` (31 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tox.wiki`
 * @homepage https://tox.wiki/en/latest/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@^3.7` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.toxwiki
 * console.log(pkg.name)        // "tox"
 * console.log(pkg.description) // "Command line driven CI frontend and development..."
 * console.log(pkg.programs)    // ["tox"]
 * console.log(pkg.versions[0]) // "4.34.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tox-wiki.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const toxwikiPackage = {
  /**
   * The display name of this package.
   */
  name: 'tox' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tox.wiki' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command line driven CI frontend and development task automation tool.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tox.wiki/package.yml' as const,
  homepageUrl: 'https://tox.wiki/en/latest/' as const,
  githubUrl: 'https://github.com/tox-dev/tox' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tox.wiki' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tox.wiki -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tox.wiki' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tox',
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
    'python.org@^3.7',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.34.1',
    '4.34.0',
    '4.33.0',
    '4.32.0',
    '4.31.0',
    '4.30.3',
    '4.30.2',
    '4.30.1',
    '4.30.0',
    '4.29.0',
    '4.28.4',
    '4.28.3',
    '4.28.2',
    '4.28.1',
    '4.28.0',
    '4.27.0',
    '4.26.0',
    '4.25.0',
    '4.24.2',
    '4.24.1',
    '4.24.0',
    '4.23.2',
    '4.23.1',
    '4.23.0',
    '4.22.0',
    '4.21.2',
    '4.21.1',
    '4.21.0',
    '4.20.0',
    '4.19.0',
    '4.18.1',
  ] as const,
  aliases: [] as const,
}

export type ToxwikiPackage = typeof toxwikiPackage
