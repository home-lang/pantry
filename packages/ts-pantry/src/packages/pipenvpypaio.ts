/**
 * **pipenv** - Python Development Workflow for Humans.
 *
 * @domain `pipenv.pypa.io`
 * @programs `pipenv`
 * @version `3000.0.0` (55 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pipenv.pypa.io`
 * @homepage https://pipenv.pypa.io
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.11`, `crates.io/semverator` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pipenvpypaio
 * console.log(pkg.name)        // "pipenv"
 * console.log(pkg.description) // " Python Development Workflow for Humans."
 * console.log(pkg.programs)    // ["pipenv"]
 * console.log(pkg.versions[0]) // "3000.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pipenv-pypa-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pipenvpypaioPackage = {
  /**
  * The display name of this package.
  */
  name: 'pipenv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pipenv.pypa.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: ' Python Development Workflow for Humans.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pipenv.pypa.io/package.yml' as const,
  homepageUrl: 'https://pipenv.pypa.io' as const,
  githubUrl: 'https://github.com/pypa/pipenv' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install pipenv.pypa.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pipenv.pypa.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pipenv.pypa.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pipenv',
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
    'crates.io/semverator',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3000.0.0',
    '2026.0.3',
    '2026.0.2',
    '2026.0.1',
    '2026.0.0',
    '2025.1.3',
    '2025.1.1',
    '2025.0.4',
    '2025.0.3',
    '2025.0.2',
    '2025.0.1',
    '2025.0.0',
    '2024.4.1',
    '2024.4.0',
    '2024.3.1',
    '2024.3.0',
    '2024.2.0',
    '2024.1.0',
    '2024.0.3',
    '2024.0.2',
    '2024.0.1',
    '2024.0.0',
    '2023.12.1',
    '2023.12.0',
    '2023.11.17',
    '2023.11.15',
    '2023.11.14',
    '2023.10.24',
    '2023.10.3',
    '2023.9.8',
    '2023.9.7',
    '2023.9.1',
    '2023.8.28',
    '2023.8.26',
    '2023.8.25',
    '2023.8.23',
    '2023.8.22',
    '2023.8.21',
    '2023.8.20',
    '2023.8.19',
    '2023.7.23',
    '2023.7.9',
    '2023.7.4',
    '2023.7.3',
    '2023.7.1',
    '2023.6.26',
    '2023.6.18',
    '2023.6.12',
    '2023.6.11',
    '2023.6.2',
    '2023.5.19',
    '2023.4.29',
    '2023.4.20',
    '2023.2.18',
    '2023.2.4',
  ] as const,
  aliases: [] as const,
}

export type PipenvpypaioPackage = typeof pipenvpypaioPackage
