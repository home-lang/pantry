/**
 * **copa** - Tool to directly patch container images given the vulnerability scanning results
 *
 * @domain `project-copacetic.github.io`
 * @programs `copa`
 * @version `0.13.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install project-copacetic.github.io`
 * @homepage https://project-copacetic.github.io/copacetic/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.projectcopaceticgithubio
 * console.log(pkg.name)        // "copa"
 * console.log(pkg.description) // "Tool to directly patch container images given t..."
 * console.log(pkg.programs)    // ["copa"]
 * console.log(pkg.versions[0]) // "0.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/project-copacetic-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const projectcopaceticgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'copa' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'project-copacetic.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Tool to directly patch container images given the vulnerability scanning results' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/project-copacetic.github.io/package.yml' as const,
  homepageUrl: 'https://project-copacetic.github.io/copacetic/' as const,
  githubUrl: 'https://github.com/project-copacetic/copacetic' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install project-copacetic.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +project-copacetic.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install project-copacetic.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'copa',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.13.0',
    '0.12.0',
    '0.11.1',
    '0.11.0',
    '0.10.0',
    '0.9.0',
    '0.8.0',
    '0.7.0',
    '0.6.2',
  ] as const,
  aliases: [] as const,
}

export type ProjectcopaceticgithubioPackage = typeof projectcopaceticgithubioPackage
