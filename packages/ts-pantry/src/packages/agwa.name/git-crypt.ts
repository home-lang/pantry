/**
 * **git-crypt** - Enable transparent encryption/decryption of files in a git repo
 *
 * @domain `agwa.name/git-crypt`
 * @programs `git-crypt`
 * @version `0.8.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install agwa.name/git-crypt`
 * @homepage https://www.agwa.name/projects/git-crypt/
 * @dependencies `openssl.org^1.1`
 * @buildDependencies `docbook.org`, `docbook.org/xsl`, `gnome.org/libxslt` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.agwanamegitcrypt
 * console.log(pkg.name)        // "git-crypt"
 * console.log(pkg.description) // "Enable transparent encryption/decryption of fil..."
 * console.log(pkg.programs)    // ["git-crypt"]
 * console.log(pkg.versions[0]) // "0.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/agwa-name/git-crypt.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const agwanamegitcryptPackage = {
  /**
  * The display name of this package.
  */
  name: 'git-crypt' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'agwa.name/git-crypt' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Enable transparent encryption/decryption of files in a git repo' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/agwa.name/git-crypt/package.yml' as const,
  homepageUrl: 'https://www.agwa.name/projects/git-crypt/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install agwa.name/git-crypt' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +agwa.name/git-crypt -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install agwa.name/git-crypt' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'git-crypt',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'docbook.org',
    'docbook.org/xsl',
    'gnome.org/libxslt',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.8.0',
    '0.7.0',
  ] as const,
  aliases: [] as const,
}

export type AgwanamegitcryptPackage = typeof agwanamegitcryptPackage
