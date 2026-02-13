/**
 * **yubikey-manager** - Python library and command line tool for configuring any YubiKey over all USB interfaces.
 *
 * @domain `developers.yubico.com/yubikey-manager`
 * @programs `ykman`
 * @version `5.9.0` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install developers.yubico.com/yubikey-manager`
 * @homepage https://developers.yubico.com/yubikey-manager/
 * @dependencies `python.org~3.11`, `linux:pcsclite.apdu.fr^2` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `pip.pypa.io`, `swig.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.developersyubicocomyubikeymanager
 * console.log(pkg.name)        // "yubikey-manager"
 * console.log(pkg.description) // "Python library and command line tool for config..."
 * console.log(pkg.programs)    // ["ykman"]
 * console.log(pkg.versions[0]) // "5.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/developers-yubico-com/yubikey-manager.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const developersyubicocomyubikeymanagerPackage = {
  /**
   * The display name of this package.
   */
  name: 'yubikey-manager' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'developers.yubico.com/yubikey-manager' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Python library and command line tool for configuring any YubiKey over all USB interfaces.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/developers.yubico.com/yubikey-manager/package.yml' as const,
  homepageUrl: 'https://developers.yubico.com/yubikey-manager/' as const,
  githubUrl: 'https://github.com/Yubico/yubikey-manager' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install developers.yubico.com/yubikey-manager' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +developers.yubico.com/yubikey-manager -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install developers.yubico.com/yubikey-manager' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ykman',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'python.org~3.11',
    'linux:pcsclite.apdu.fr^2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'pip.pypa.io',
    'swig.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.9.0',
    '5.8.0',
    '5.7.2',
    '5.7.1',
    '5.7.0',
    '5.6.1',
    '5.6.0',
    '5.5.1',
    '5.5.0',
    '5.4.0',
    '5.3.0',
    '5.2.1',
  ] as const,
  aliases: [] as const,
}

export type DevelopersyubicocomyubikeymanagerPackage = typeof developersyubicocomyubikeymanagerPackage
