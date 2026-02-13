/**
 * **age-plugin-yubikey** - Plugin for encrypting files with age and PIV tokens such as YubiKeys
 *
 * @domain `github.com/str4d/age-plugin-yubikey`
 * @programs `age-plugin-yubikey`
 * @version `0.5.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/str4d/age-plugin-yubikey`
 * @dependencies `linux:pcsclite.apdu.fr^2` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomstr4dagepluginyubikey
 * console.log(pkg.name)        // "age-plugin-yubikey"
 * console.log(pkg.description) // "Plugin for encrypting files with age and PIV to..."
 * console.log(pkg.programs)    // ["age-plugin-yubikey"]
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/str4d/age-plugin-yubikey.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const agepluginyubikeyPackage = {
  /**
   * The display name of this package.
   */
  name: 'age-plugin-yubikey' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/str4d/age-plugin-yubikey' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Plugin for encrypting files with age and PIV tokens such as YubiKeys' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/str4d/age-plugin-yubikey/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/str4d/age-plugin-yubikey' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/str4d/age-plugin-yubikey' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/str4d/age-plugin-yubikey -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/str4d/age-plugin-yubikey' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'age-plugin-yubikey',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:pcsclite.apdu.fr^2',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.0',
    '0.4.0',
  ] as const,
  aliases: [] as const,
}

export type AgepluginyubikeyPackage = typeof agepluginyubikeyPackage
