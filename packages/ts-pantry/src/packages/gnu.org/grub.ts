/**
 * **grub** - GNU GRand Unified Bootloader
 *
 * @domain `gnu.org/grub`
 * @programs `grub-install`, `grub-mkconfig`, `grub-mkimage`, `grub-mkrescue` and more
 * @version `2.14.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install gnu.org/grub`
 * @homepage https://www.gnu.org/software/grub/
 * @buildDependencies `gnu.org/bison`, `gnu.org/m4`, `github.com/westes/flex`, `gnu.org/autoconf`, `gnu.org/automake`, `freedesktop.org/pkg-config`, `python.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggrub
 * console.log(pkg.name)        // "grub"
 * console.log(pkg.description) // "GNU GRand Unified Bootloader"
 * console.log(pkg.programs)    // ["grub-install", "grub-mkconfig", ...]
 * console.log(pkg.versions[0]) // "2.14.0" (latest)
 * ```
 *
 * @see https://www.gnu.org/software/grub/
 */
export const gnuorggrubPackage = {
  /**
  * The display name of this package.
  */
  name: 'grub' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/grub' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'GNU GRand Unified Bootloader' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://www.gnu.org/software/grub/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  */
  installCommand: 'pantry install gnu.org/grub' as const,
  pkgxInstallCommand: '' as const,
  launchpadInstallCommand: 'pantry install gnu.org/grub' as const,
  /**
  * Executable programs provided by this package.
  */
  programs: [
    'grub-bios-setup',
    'grub-editenv',
    'grub-file',
    'grub-fstest',
    'grub-install',
    'grub-kbdcomp',
    'grub-menulst2cfg',
    'grub-mkconfig',
    'grub-mkimage',
    'grub-mklayout',
    'grub-mknetdir',
    'grub-mkpasswd-pbkdf2',
    'grub-mkrelpath',
    'grub-mkrescue',
    'grub-mkstandalone',
    'grub-mount',
    'grub-probe',
    'grub-reboot',
    'grub-render-label',
    'grub-script-check',
    'grub-set-default',
    'grub-syslinux2cfg',
  ] as const,
  companions: [] as const,
  dependencies: [
    'gnu.org/gettext',
    'sourceware.org/bzip2',
    'tukaani.org/xz',
    'zlib.net',
    'gnupg.org/libgcrypt',
    'gnu.org/libunistring',
  ] as const,
  /**
  * Build dependencies for this package.
  */
  buildDependencies: [
    'gnu.org/bison',
    'gnu.org/m4',
    'github.com/westes/flex',
    'gnu.org/autoconf',
    'gnu.org/automake',
    'freedesktop.org/pkg-config',
    'python.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  */
  versions: [
    '2.14.0',
    '2.12.0',
    '2.6.0',
    '2.4.0',
    '2.2.0',
    '2.0.0',
    '1.99.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorggrubPackage = typeof gnuorggrubPackage
