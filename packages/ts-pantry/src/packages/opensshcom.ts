/**
 * **openssh** - pkgx package
 *
 * @domain `openssh.com`
 * @programs `scp`, `sftp`, `slogin`, `ssh`, `ssh-add`, ... (+4 more)
 * @version `10.2.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openssh.com`
 * @dependencies `nlnetlabs.nl/ldns`, `developers.yubico.com/libfido2`, `openssl.org`, ... (+5 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `curl.se`, `darwin:gnu.org/patch`, `linux:gnu.org/gcc`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.opensshcom
 * console.log(pkg.name)        // "openssh"
 * console.log(pkg.programs)    // ["scp", "sftp", ...]
 * console.log(pkg.versions[0]) // "10.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openssh-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const opensshcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'openssh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openssh.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openssh.com/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openssh.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openssh.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openssh.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'scp',
    'sftp',
    'slogin',
    'ssh',
    'ssh-add',
    'ssh-agent',
    'ssh-keygen',
    'ssh-keyscan',
    'sshd',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'nlnetlabs.nl/ldns',
    'developers.yubico.com/libfido2',
    'openssl.org',
    'kerberos.org',
    'thrysoee.dk/editline',
    'github.com/besser82/libxcrypt',
    'zlib.net',
    'linux:linux-pam.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'curl.se',
    'darwin:gnu.org/patch',
    'linux:gnu.org/gcc',
    'linux:gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '10.2.0',
    '10.1.0',
    '10.0.0',
    '9.9.0',
    '9.8.0',
    '9.7.0',
    '9.6.0',
    '9.5.0',
  ] as const,
  aliases: [] as const,
}

export type OpensshcomPackage = typeof opensshcomPackage
