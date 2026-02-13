/**
 * **qemu** - Generic machine emulator and virtualizer
 *
 * @domain `qemu.org`
 * @programs `qemu-img`, `qemu-edid`, `qemu-io`, `qemu-nbd`, `qemu-storage-daemon`, ... (+29 more)
 * @version `10.2.0` (65 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install qemu.org`
 * @homepage https://www.qemu.org/
 * @dependencies `gnome.org/glib@2`, `capstone-engine.org^4`, `pixman.org^0`, ... (+7 more)
 * @buildDependencies `gnu.org/bison`, `github.com/westes/flex`, `python.org@~3.11`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.qemuorg
 * console.log(pkg.name)        // "qemu"
 * console.log(pkg.description) // "Generic machine emulator and virtualizer"
 * console.log(pkg.programs)    // ["qemu-img", "qemu-edid", ...]
 * console.log(pkg.versions[0]) // "10.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/qemu-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const qemuorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'qemu' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'qemu.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generic machine emulator and virtualizer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/qemu.org/package.yml' as const,
  homepageUrl: 'https://www.qemu.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install qemu.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +qemu.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install qemu.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'qemu-img',
    'qemu-edid',
    'qemu-io',
    'qemu-nbd',
    'qemu-storage-daemon',
    'qemu-system-aarch64',
    'qemu-system-alpha',
    'qemu-system-arm',
    'qemu-system-avr',
    'qemu-system-hppa',
    'qemu-system-i386',
    'qemu-system-loongarch64',
    'qemu-system-m68k',
    'qemu-system-microblaze',
    'qemu-system-microblazeel',
    'qemu-system-mips',
    'qemu-system-mips64',
    'qemu-system-mips64el',
    'qemu-system-mipsel',
    'qemu-system-or1k',
    'qemu-system-ppc',
    'qemu-system-ppc64',
    'qemu-system-riscv32',
    'qemu-system-riscv64',
    'qemu-system-rx',
    'qemu-system-s390x',
    'qemu-system-sh4',
    'qemu-system-sh4eb',
    'qemu-system-sparc',
    'qemu-system-sparc64',
    'qemu-system-tricore',
    'qemu-system-x86_64',
    'qemu-system-xtensa',
    'qemu-system-xtensaeb',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib@2',
    'capstone-engine.org^4',
    'pixman.org^0',
    'gnutls.org^3',
    'freedesktop.org/slirp^4',
    'virtualsquare.org/vde^2',
    'facebook.com/zstd^1',
    'invisible-island.net/ncurses^6',
    'libssh.org^0',
    'libpng.org^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/bison',
    'github.com/westes/flex',
    'python.org@~3.11',
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '10.2.0',
    '10.1.3',
    '10.1.2',
    '10.1.1',
    '10.1.0',
    '10.0.7',
    '10.0.6',
    '10.0.5',
    '10.0.4',
    '10.0.3',
    '10.0.2',
    '9.2.4',
    '9.2.3',
    '9.2.2',
    '9.2.1',
    '9.2.0',
    '9.1.3',
    '9.1.2',
    '9.1.1',
    '9.1.0',
    '9.0.4',
    '9.0.3',
    '9.0.2',
    '9.0.1',
    '9.0.0',
    '8.2.10',
    '8.2.9',
    '8.2.8',
    '8.2.7',
    '8.2.6',
    '8.2.5',
    '8.2.4',
    '8.2.3',
    '8.2.2',
    '8.2.1',
    '8.2.0',
    '8.1.5',
    '8.1.4',
    '8.1.3',
    '8.1.2',
    '8.1.1',
    '8.1.0',
    '8.0.5',
    '8.0.3',
    '8.0.2',
    '8.0.0',
    '7.2.22',
    '7.2.21',
    '7.2.20',
    '7.2.19',
    '7.2.18',
    '7.2.17',
    '7.2.16',
    '7.2.15',
    '7.2.14',
    '7.2.13',
    '7.2.12',
    '7.2.11',
    '7.2.10',
    '7.2.9',
    '7.2.8',
    '7.2.7',
    '7.2.6',
    '7.2.4',
    '7.2.3',
  ] as const,
  aliases: [] as const,
}

export type QemuorgPackage = typeof qemuorgPackage
