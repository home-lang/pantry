/**
 * **libgcrypt** - Cryptographic library based on the code from GnuPG
 *
 * @domain `gnupg.org/libgcrypt`
 * @programs `dumpsexp`, `hmac256`, `libgcrypt-config`, `mpicalc`
 * @version `1.12.1` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnupg.org/libgcrypt`
 * @homepage https://gnupg.org/related_software/libgcrypt/
 * @buildDependencies `darwinsys.com/file`, `darwin:llvm.org`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnupgorglibgcrypt
 * console.log(pkg.name)        // "libgcrypt"
 * console.log(pkg.description) // "Cryptographic library based on the code from GnuPG"
 * console.log(pkg.programs)    // ["dumpsexp", "hmac256", ...]
 * console.log(pkg.versions[0]) // "1.12.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnupg-org/libgcrypt.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnupgorglibgcryptPackage = {
  /**
  * The display name of this package.
  */
  name: 'libgcrypt' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnupg.org/libgcrypt' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Cryptographic library based on the code from GnuPG' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libgcrypt/package.yml' as const,
  homepageUrl: 'https://gnupg.org/related_software/libgcrypt/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnupg.org/libgcrypt' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnupg.org/libgcrypt -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnupg.org/libgcrypt' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dumpsexp',
    'hmac256',
    'libgcrypt-config',
    'mpicalc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'darwinsys.com/file',
    'darwin:llvm.org',
    'linux:gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.12.1',
    '1.12.0',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.3',
    '1.10.1',
    '1.8.12',
  ] as const,
  aliases: [] as const,
}

export type GnupgorglibgcryptPackage = typeof gnupgorglibgcryptPackage
