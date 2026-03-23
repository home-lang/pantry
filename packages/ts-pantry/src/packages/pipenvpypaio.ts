/**
 * **pipenv** - Python Development Workflow for Humans.
 *
 * @domain `pipenv.pypa.io`
 * @programs `pipenv`
 * @version `3000.0.0` (58 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install pipenv.pypa.io`
 * @homepage https://pipenv.pypa.io
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.11`, `crates.io/semverator` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.pipenvpypaio
 * console.log(pkg.name)        // "pipenv"
 * console.log(pkg.description) // " Python Development Workflow for Humans."
 * console.log(pkg.programs)    // ["pipenv"]
 * console.log(pkg.versions[0]) // "3000.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/pipenv-pypa-io.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install pipenv.pypa.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pipenv.pypa.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install pipenv.pypa.io' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3000.0.0',
    '2026.2.1',
    '2026.2.0',
    '2026.1.0',
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
  ] as const,
  aliases: [] as const,
}

export type PipenvpypaioPackage = typeof pipenvpypaioPackage
