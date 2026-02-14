/**
 * **systemd** - The systemd System and Service Manager
 *
 * @domain `systemd.io`
 * @programs `busctl`, `coredumpctl`, `hostnamectl`, `journalctl`, `kernel-install`, ... (+50 more)
 * @version `257.10.0` (31 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install systemd.io`
 * @homepage https://systemd.io
 * @dependencies `libexpat.github.io`, `google.com/fullycapable`, `lz4.org`, ... (+10 more)
 * @buildDependencies `gnu.org/coreutils`, `docbook.org`, `gnu.org/gettext`, ... (+8 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.systemdio
 * console.log(pkg.name)        // "systemd"
 * console.log(pkg.description) // "The systemd System and Service Manager "
 * console.log(pkg.programs)    // ["busctl", "coredumpctl", ...]
 * console.log(pkg.versions[0]) // "257.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/systemd-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const systemdioPackage = {
  /**
  * The display name of this package.
  */
  name: 'systemd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'systemd.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The systemd System and Service Manager ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/systemd.io/package.yml' as const,
  homepageUrl: 'https://systemd.io' as const,
  githubUrl: 'https://github.com/systemd/systemd' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install systemd.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +systemd.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install systemd.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'busctl',
    'coredumpctl',
    'hostnamectl',
    'journalctl',
    'kernel-install',
    'localectl',
    'loginctl',
    'machinectl',
    'networkctl',
    'oomctl',
    'portablectl',
    'resolvectl',
    'systemctl',
    'systemd-ac-power',
    'systemd-analyze',
    'systemd-ask-password',
    'systemd-cat',
    'systemd-cgls',
    'systemd-cgtop',
    'systemd-confext',
    'systemd-creds',
    'systemd-delta',
    'systemd-detect-virt',
    'systemd-dissect',
    'systemd-escape',
    'systemd-firstboot',
    'systemd-id128',
    'systemd-inhibit',
    'systemd-machine-id-setup',
    'systemd-mount',
    'systemd-notify',
    'systemd-nspawn',
    'systemd-path',
    'systemd-repart',
    'systemd-resolve',
    'systemd-run',
    'systemd-socket-activate',
    'systemd-stdio-bridge',
    'systemd-sysext',
    'systemd-sysusers',
    'systemd-tmpfiles',
    'systemd-tty-ask-password-agent',
    'systemd-umount',
    'timedatectl',
    'udevadm',
    'userdbctl',
    'halt',
    'init',
    'mount.ddi',
    'poweroff',
    'reboot',
    'resolvconf',
    'runlevel',
    'shutdown',
    'telinit',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libexpat.github.io',
    'google.com/fullycapable',
    'lz4.org',
    'openssl.org^1.1',
    'github.com/util-linux/util-linux',
    'tukaani.org/xz',
    'facebook.com/zstd',
    'github.com/besser82/libxcrypt',
    'curl.se',
    'gnu.org/libidn2',
    'gnutls.org',
    'sourceware.org/bzip2',
    'pcre.org/v2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/coreutils',
    'docbook.org',
    'gnu.org/gettext',
    'gnu.org/gperf',
    'gnu.org/libtool',
    'gnome.org/libxslt',
    'gnome.org/libxml2@~2.13',
    'gnu.org/m4',
    'mesonbuild.com',
    'python.org@>=3<3.12',
    'rsync.samba.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '257.10.0',
    '257.9.0',
    '257.8.0',
    '257.7.0',
    '257.6.0',
    '257.5.0',
    '257.4.0',
    '257.3.0',
    '257.2.0',
    '257.1.0',
    '257.0.0',
    '256.17.0',
    '256.16.0',
    '256.15.0',
    '256.14.0',
    '256.13.0',
    '256.12.0',
    '256.11.0',
    '256.10.0',
    '256.9.0',
    '256.8.0',
    '256.7.0',
    '256.6.0',
    '256.5.0',
    '256.4.0',
    '256.3.0',
    '256.2.0',
    '256.1.0',
    '256.0.0',
    '255.0.0',
    '254.0.0',
  ] as const,
  aliases: [] as const,
}

export type SystemdioPackage = typeof systemdioPackage
