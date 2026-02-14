/**
 * **fido2** - Provides library functionality for FIDO2, including communication with a device over USB or NFC.
 *
 * @domain `developers.yubico.com/libfido2`
 * @programs `fido2-assert`, `fido2-cred`, `fido2-token`
 * @version `1.16.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install developers.yubico.com/libfido2`
 * @homepage https://developers.yubico.com/libfido2/
 * @dependencies `github.com/PJK/libcbor@0`, `openssl.org@1`, `zlib.net@1`, ... (+1 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.developersyubicocomlibfido2
 * console.log(pkg.name)        // "fido2"
 * console.log(pkg.description) // "Provides library functionality for FIDO2, inclu..."
 * console.log(pkg.programs)    // ["fido2-assert", "fido2-cred", ...]
 * console.log(pkg.versions[0]) // "1.16.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/developers-yubico-com/libfido2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const developersyubicocomlibfido2Package = {
  /**
  * The display name of this package.
  */
  name: 'fido2' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'developers.yubico.com/libfido2' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Provides library functionality for FIDO2, including communication with a device over USB or NFC.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/developers.yubico.com/libfido2/package.yml' as const,
  homepageUrl: 'https://developers.yubico.com/libfido2/' as const,
  githubUrl: 'https://github.com/Yubico/libfido2' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install developers.yubico.com/libfido2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +developers.yubico.com/libfido2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install developers.yubico.com/libfido2' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'fido2-assert',
    'fido2-cred',
    'fido2-token',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'github.com/PJK/libcbor@0',
    'openssl.org@1',
    'zlib.net@1',
    'linux:systemd.io',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
  ] as const,
  aliases: [] as const,
}

export type Developersyubicocomlibfido2Package = typeof developersyubicocomlibfido2Package
