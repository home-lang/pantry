/**
 * **envchain** - Environment variables meet macOS Keychain and gnome-keyring <3
 *
 * @domain `github.com/sorah/envchain`
 * @programs `envchain`
 * @version `1.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/sorah/envchain`
 * @dependencies `linux:gnu.org/readline`, `linux:gnome.org/libsecret` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `llvm.org`, `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsorahenvchain
 * console.log(pkg.name)        // "envchain"
 * console.log(pkg.description) // "Environment variables meet macOS Keychain and g..."
 * console.log(pkg.programs)    // ["envchain"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/sorah/envchain.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const envchainPackage = {
  /**
   * The display name of this package.
   */
  name: 'envchain' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/sorah/envchain' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Environment variables meet macOS Keychain and gnome-keyring <3' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/sorah/envchain/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sorah/envchain' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/sorah/envchain' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/sorah/envchain -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/sorah/envchain' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'envchain',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:gnu.org/readline',
    'linux:gnome.org/libsecret',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'llvm.org',
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type EnvchainPackage = typeof envchainPackage
