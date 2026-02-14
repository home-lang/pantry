/**
 * **xinput** - Utility to configure and test X input devices
 *
 * @domain `x.org/xinput`
 * @programs `xinput`
 * @version `1.6.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xinput`
 * @homepage https://gitlab.freedesktop.org/xorg/app/xinput
 * @dependencies `x.org/x11`, `x.org/exts`, `x.org/xi`, ... (+2 more)
 * @buildDependencies `x.org/protocol` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxinput
 * console.log(pkg.name)        // "xinput"
 * console.log(pkg.description) // "Utility to configure and test X input devices"
 * console.log(pkg.programs)    // ["xinput"]
 * console.log(pkg.versions[0]) // "1.6.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xinput.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxinputPackage = {
  /**
  * The display name of this package.
  */
  name: 'xinput' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xinput' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Utility to configure and test X input devices' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xinput/package.yml' as const,
  homepageUrl: 'https://gitlab.freedesktop.org/xorg/app/xinput' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/xinput' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xinput -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xinput' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'xinput',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/x11',
    'x.org/exts',
    'x.org/xi',
    'x.org/xinerama',
    'x.org/xrandr',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'x.org/protocol',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.6.4',
  ] as const,
  aliases: [] as const,
}

export type XorgxinputPackage = typeof xorgxinputPackage
