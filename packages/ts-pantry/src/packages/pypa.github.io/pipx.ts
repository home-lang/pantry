/**
 * **pipx** - Execute binaries from Python packages in isolated environments
 *
 * @domain `pypa.github.io/pipx`
 * @programs `pipx`
 * @version `1.8.0` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pypa.github.io/pipx`
 * @homepage https://pipx.pypa.io
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pypagithubiopipx
 * console.log(pkg.name)        // "pipx"
 * console.log(pkg.description) // "Execute binaries from Python packages in isolat..."
 * console.log(pkg.programs)    // ["pipx"]
 * console.log(pkg.versions[0]) // "1.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pypa-github-io/pipx.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pypagithubiopipxPackage = {
  /**
   * The display name of this package.
   */
  name: 'pipx' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pypa.github.io/pipx' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Execute binaries from Python packages in isolated environments' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pypa.github.io/pipx/package.yml' as const,
  homepageUrl: 'https://pipx.pypa.io' as const,
  githubUrl: 'https://github.com/pypa/pipx' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pypa.github.io/pipx' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pypa.github.io/pipx -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pypa.github.io/pipx' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pipx',
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
    '1.8.0',
    '1.7.1',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type PypagithubiopipxPackage = typeof pypagithubiopipxPackage
