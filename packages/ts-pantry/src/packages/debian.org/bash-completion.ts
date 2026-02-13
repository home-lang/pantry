/**
 * **bash-completion** - pkgx package
 *
 * @domain `debian.org/bash-completion`
 * @version `2.11.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install debian.org/bash-completion`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.debianorgbashcompletion
 * console.log(pkg.name)        // "bash-completion"
 * console.log(pkg.versions[0]) // "2.11.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/debian-org/bash-completion.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const debianorgbashcompletionPackage = {
  /**
   * The display name of this package.
   */
  name: 'bash-completion' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'debian.org/bash-completion' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/debian.org/bash-completion/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install debian.org/bash-completion' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +debian.org/bash-completion -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install debian.org/bash-completion' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.11.0',
  ] as const,
  aliases: [] as const,
}

export type DebianorgbashcompletionPackage = typeof debianorgbashcompletionPackage
