/**
 * **pcsc-lite** - pkgx package
 *
 * @domain `pcsclite.apdu.fr`
 * @programs `pcscd`
 * @version `2.4.1` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pcsclite.apdu.fr`
 * @dependencies `libusb.info^1`, `linux:systemd.io^254 # libudev` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3`, `mesonbuild.com@^1`, `github.com/westes/flex`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pcscliteapdufr
 * console.log(pkg.name)        // "pcsc-lite"
 * console.log(pkg.programs)    // ["pcscd"]
 * console.log(pkg.versions[0]) // "2.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pcsclite-apdu-fr.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pcscliteapdufrPackage = {
  /**
   * The display name of this package.
   */
  name: 'pcsc-lite' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pcsclite.apdu.fr' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pcsclite.apdu.fr/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pcsclite.apdu.fr' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pcsclite.apdu.fr -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pcsclite.apdu.fr' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pcscd',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'libusb.info^1',
    'linux:systemd.io^254 # libudev',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
    'mesonbuild.com@^1',
    'github.com/westes/flex',
    'perl.org@^5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.1',
    '2.4.0',
    '2.3.3',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.0',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type PcscliteapdufrPackage = typeof pcscliteapdufrPackage
