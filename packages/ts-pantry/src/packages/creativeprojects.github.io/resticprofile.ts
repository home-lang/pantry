/**
 * **resticprofile** - Configuration profiles manager and scheduler for restic backup
 *
 * @domain `creativeprojects.github.io/resticprofile`
 * @programs `resticprofile`
 * @version `0.32.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install creativeprojects.github.io/resticprofile`
 * @homepage https://creativeprojects.github.io/resticprofile/
 * @buildDependencies `go.dev@~1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.creativeprojectsgithubioresticprofile
 * console.log(pkg.name)        // "resticprofile"
 * console.log(pkg.description) // "Configuration profiles manager and scheduler fo..."
 * console.log(pkg.programs)    // ["resticprofile"]
 * console.log(pkg.versions[0]) // "0.32.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/creativeprojects-github-io/resticprofile.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const creativeprojectsgithubioresticprofilePackage = {
  /**
   * The display name of this package.
   */
  name: 'resticprofile' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'creativeprojects.github.io/resticprofile' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Configuration profiles manager and scheduler for restic backup' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/creativeprojects.github.io/resticprofile/package.yml' as const,
  homepageUrl: 'https://creativeprojects.github.io/resticprofile/' as const,
  githubUrl: 'https://github.com/creativeprojects/resticprofile' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install creativeprojects.github.io/resticprofile' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +creativeprojects.github.io/resticprofile -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install creativeprojects.github.io/resticprofile' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'resticprofile',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.22',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.32.0',
    '0.31.0',
    '0.30.1',
    '0.30.0',
    '0.29.1',
    '0.29.0',
    '0.28.1',
    '0.28.0',
    '0.27.1',
  ] as const,
  aliases: [] as const,
}

export type CreativeprojectsgithubioresticprofilePackage = typeof creativeprojectsgithubioresticprofilePackage
