/**
 * **git-crypt** - Enable transparent encryption/decryption of files in a git repo
 *
 * @domain `agwa.name`
 * @programs `git-crypt`
 * @version `0.7.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pkgx agwa.name/git-crypt`
 * @name `git-crypt`
 * @homepage https://www.agwa.name/projects/git-crypt/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access the package
 * const pkg = pantry.gitcrypt
 * // Or access via domain
 * const samePkg = pantry.agwanamegitcrypt
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "git-crypt"
 * console.log(pkg.description) // "Enable transparent encryption/decryption of fil..."
 * console.log(pkg.programs)    // ["git-crypt"]
 * console.log(pkg.versions[0]) // "0.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/agwa-name/git-crypt.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitcryptPackage = {
  /**
   * The display name of this package.
   */
  name: 'git-crypt' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'agwa.name' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Enable transparent encryption/decryption of files in a git repo' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/agwa.name/git-crypt/package.yml' as const,
  homepageUrl: 'https://www.agwa.name/projects/git-crypt/' as const,
  githubUrl: 'https://github.com/AGWA/git-crypt' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'pkgx agwa.name/git-crypt' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +agwa.name/git-crypt -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install git-crypt' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'git-crypt',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.0',
  ] as const,
  /**
   * Alternative names for this package.
   * You can use any of these names to access the package.
   */
  aliases: [] as const,
  fullPath: 'agwa.name/git-crypt' as const,
}

export type GitcryptPackage = typeof gitcryptPackage
