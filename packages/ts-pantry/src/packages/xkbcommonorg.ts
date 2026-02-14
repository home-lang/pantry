/**
 * **xkbcli** - keymap handling library for toolkits and window systems
 *
 * @domain `xkbcommon.org`
 * @programs `xkbcli`
 * @version `1.13.0` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xkbcommon.org`
 * @homepage https://xkbcommon.org/
 * @dependencies `x.org/x11`, `x.org/xcb`, `freedesktop.org/XKeyboardConfig`, ... (+1 more)
 * @buildDependencies `gnu.org/bison`, `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xkbcommonorg
 * console.log(pkg.name)        // "xkbcli"
 * console.log(pkg.description) // "keymap handling library for toolkits and window..."
 * console.log(pkg.programs)    // ["xkbcli"]
 * console.log(pkg.versions[0]) // "1.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xkbcommon-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xkbcommonorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'xkbcli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'xkbcommon.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'keymap handling library for toolkits and window systems' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xkbcommon.org/package.yml' as const,
  homepageUrl: 'https://xkbcommon.org/' as const,
  githubUrl: 'https://github.com/xkbcommon/libxkbcommon' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install xkbcommon.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xkbcommon.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xkbcommon.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xkbcli',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/x11',
    'x.org/xcb',
    'freedesktop.org/XKeyboardConfig',
    'gnome.org/libxml2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/bison',
    'mesonbuild.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.13.0',
    '1.12.4',
    '1.12.3',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.0',
    '1.10.0',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.1',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
  ] as const,
  aliases: [] as const,
}

export type XkbcommonorgPackage = typeof xkbcommonorgPackage
