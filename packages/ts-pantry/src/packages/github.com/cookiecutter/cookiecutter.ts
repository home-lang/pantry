/**
 * **cookiecutter** - A cross-platform command-line utility that creates projects from cookiecutters (project templates), e.g. Python package projects, C projects.
 *
 * @domain `github.com/cookiecutter/cookiecutter`
 * @programs `cookiecutter`
 * @version `2.6.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/cookiecutter/cookiecutter`
 * @homepage https://pypi.org/project/cookiecutter/
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcookiecuttercookiecutter
 * console.log(pkg.name)        // "cookiecutter"
 * console.log(pkg.description) // "A cross-platform command-line utility that crea..."
 * console.log(pkg.programs)    // ["cookiecutter"]
 * console.log(pkg.versions[0]) // "2.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/cookiecutter/cookiecutter.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cookiecutterPackage = {
  /**
  * The display name of this package.
  */
  name: 'cookiecutter' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/cookiecutter/cookiecutter' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A cross-platform command-line utility that creates projects from cookiecutters (project templates), e.g. Python package projects, C projects.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cookiecutter/cookiecutter/package.yml' as const,
  homepageUrl: 'https://pypi.org/project/cookiecutter/' as const,
  githubUrl: 'https://github.com/cookiecutter/cookiecutter' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/cookiecutter/cookiecutter' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/cookiecutter/cookiecutter -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/cookiecutter/cookiecutter' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cookiecutter',
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
    'python.org@~3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.6.0',
  ] as const,
  aliases: [] as const,
}

export type CookiecutterPackage = typeof cookiecutterPackage
