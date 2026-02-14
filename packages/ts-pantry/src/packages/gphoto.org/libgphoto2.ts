/**
 * **gphoto2** - The libgphoto2 camera access and control library.
 *
 * @domain `gphoto.org/libgphoto2`
 * @programs `gphoto2-config`, `gphoto2-port-config`
 * @version `2.5.33` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gphoto.org/libgphoto2`
 * @homepage http://www.gphoto.org/proj/libgphoto2/
 * @dependencies `libgd.github.io^2.3`, `libjpeg-turbo.org^2`, `libexif.github.io^0.6`, ... (+4 more)
 * @buildDependencies `linux:gnu.org/gcc`, `linux:systemd.io` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gphotoorglibgphoto2
 * console.log(pkg.name)        // "gphoto2"
 * console.log(pkg.description) // "The libgphoto2 camera access and control library."
 * console.log(pkg.programs)    // ["gphoto2-config", "gphoto2-port-config"]
 * console.log(pkg.versions[0]) // "2.5.33" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gphoto-org/libgphoto2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gphotoorglibgphoto2Package = {
  /**
  * The display name of this package.
  */
  name: 'gphoto2' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gphoto.org/libgphoto2' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The libgphoto2 camera access and control library.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gphoto.org/libgphoto2/package.yml' as const,
  homepageUrl: 'http://www.gphoto.org/proj/libgphoto2/' as const,
  githubUrl: 'https://github.com/gphoto/libgphoto2' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gphoto.org/libgphoto2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gphoto.org/libgphoto2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gphoto.org/libgphoto2' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gphoto2-config',
    'gphoto2-port-config',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libgd.github.io^2.3',
    'libjpeg-turbo.org^2',
    'libexif.github.io^0.6',
    'gnu.org/libtool^2.4',
    'libusb.info/compat^0.1',
    'curl.se^8',
    'gnome.org/libxml2^2.12',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc',
    'linux:systemd.io',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.5.33',
    '2.5.32',
    '2.5.31',
  ] as const,
  aliases: [] as const,
}

export type Gphotoorglibgphoto2Package = typeof gphotoorglibgphoto2Package
