/**
 * **cb** - 😎🏖️🐬 Your new, 𝙧𝙞𝙙𝙤𝙣𝙠𝙪𝙡𝙞𝙘𝙞𝙤𝙪𝙨𝙡𝙮 smart clipboard manager
 *
 * @domain `getclipboard.app`
 * @programs `cb`
 * @version `0.10.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install getclipboard.app`
 * @homepage https://getclipboard.app
 * @dependencies `openssl.org^1.1`, `linux:alsa-project.org/alsa-lib@1`, `linux:x.org/x11@1`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3`, `linux:wayland.freedesktop.org/protocols`, `linux:gnu.org/gcc@14` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.getclipboardapp
 * console.log(pkg.name)        // "cb"
 * console.log(pkg.description) // "😎🏖️🐬 Your new, 𝙧𝙞𝙙𝙤𝙣𝙠𝙪𝙡𝙞𝙘𝙞𝙤𝙪𝙨�..."
 * console.log(pkg.programs)    // ["cb"]
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/getclipboard-app.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const getclipboardappPackage = {
  /**
  * The display name of this package.
  */
  name: 'cb' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'getclipboard.app' as const,
  /**
  * Brief description of what this package does.
  */
  description: '😎🏖️🐬 Your new, 𝙧𝙞𝙙𝙤𝙣𝙠𝙪𝙡𝙞𝙘𝙞𝙤𝙪𝙨𝙡𝙮 smart clipboard manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/getclipboard.app/package.yml' as const,
  homepageUrl: 'https://getclipboard.app' as const,
  githubUrl: 'https://github.com/Slackadays/Clipboard' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install getclipboard.app' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +getclipboard.app -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install getclipboard.app' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cb',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'openssl.org^1.1',
    'linux:alsa-project.org/alsa-lib@1',
    'linux:x.org/x11@1',
    'linux:wayland.freedesktop.org@1',
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org@^3',
    'linux:wayland.freedesktop.org/protocols',
    'linux:gnu.org/gcc@14',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.0',
    '0.9.1',
    '0.9.0.1',
  ] as const,
  aliases: [] as const,
}

export type GetclipboardappPackage = typeof getclipboardappPackage
