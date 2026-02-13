/**
 * **git-credential-manager** - Secure, cross-platform Git credential storage with authentication to GitHub, Azure Repos, and other popular Git hosting services.
 *
 * @domain `github.com/git-ecosystem/git-credential-manager`
 * @programs `git-credential-manager`
 * @version `2.7.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/git-ecosystem/git-credential-manager`
 * @dependencies `openssl.org^1.1.1`, `unicode.org^71`, `zlib.net^1.3`, ... (+1 more)
 * @buildDependencies `kerberos.org@^1.21.3`, `linux:gnu.org/gcc@>=12` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgitecosystemgitcredentialmanager
 * console.log(pkg.name)        // "git-credential-manager"
 * console.log(pkg.description) // "Secure, cross-platform Git credential storage w..."
 * console.log(pkg.programs)    // ["git-credential-manager"]
 * console.log(pkg.versions[0]) // "2.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/git-ecosystem/git-credential-manager.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitcredentialmanagerPackage = {
  /**
   * The display name of this package.
   */
  name: 'git-credential-manager' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/git-ecosystem/git-credential-manager' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Secure, cross-platform Git credential storage with authentication to GitHub, Azure Repos, and other popular Git hosting services.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/git-ecosystem/git-credential-manager/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/git-ecosystem/git-credential-manager' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/git-ecosystem/git-credential-manager' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/git-ecosystem/git-credential-manager -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/git-ecosystem/git-credential-manager' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'git-credential-manager',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1.1',
    'unicode.org^71',
    'zlib.net^1.3',
    'dotnet.microsoft.com^8.0',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'kerberos.org@^1.21.3',
    'linux:gnu.org/gcc@>=12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.7.0',
    '2.6.1',
  ] as const,
  aliases: [] as const,
}

export type GitcredentialmanagerPackage = typeof gitcredentialmanagerPackage
