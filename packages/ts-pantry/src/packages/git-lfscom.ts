/**
 * **git-lfs** - Git extension for versioning large files
 *
 * @domain `git-lfs.com`
 * @programs `git-lfs`
 * @version `3.7.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install git-lfs.com`
 * @homepage https://git-lfs.github.com/
 * @dependencies `git-scm.org`
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitlfscom
 * console.log(pkg.name)        // "git-lfs"
 * console.log(pkg.description) // "Git extension for versioning large files"
 * console.log(pkg.programs)    // ["git-lfs"]
 * console.log(pkg.versions[0]) // "3.7.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/git-lfs-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitlfscomPackage = {
  /**
   * The display name of this package.
   */
  name: 'git-lfs' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'git-lfs.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Git extension for versioning large files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/git-lfs.com/package.yml' as const,
  homepageUrl: 'https://git-lfs.github.com/' as const,
  githubUrl: 'https://github.com/git-lfs/git-lfs' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install git-lfs.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +git-lfs.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install git-lfs.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'git-lfs',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'git-scm.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.7.1',
    '3.7.0',
    '3.6.1',
    '3.6.0',
    '3.5.1',
    '3.4.1',
    '3.4.0',
    '3.3.0',
  ] as const,
  aliases: [] as const,
}

export type GitlfscomPackage = typeof gitlfscomPackage
