/**
 * **dbus** - Message bus system, providing inter-application communication
 *
 * @domain `freedesktop.org/dbus`
 * @programs `dbus-cleanup-sockets`, `dbus-daemon`, `dbus-launch`, `dbus-monitor`, `dbus-run-session`, ... (+4 more)
 * @version `1.16.2` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/dbus`
 * @homepage https://wiki.freedesktop.org/www/Software/dbus
 * @buildDependencies `pagure.io/xmlto`, `libexpat.github.io`, `mesonbuild.com`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgdbus
 * console.log(pkg.name)        // "dbus"
 * console.log(pkg.description) // "Message bus system, providing inter-application..."
 * console.log(pkg.programs)    // ["dbus-cleanup-sockets", "dbus-daemon", ...]
 * console.log(pkg.versions[0]) // "1.16.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/dbus.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgdbusPackage = {
  /**
  * The display name of this package.
  */
  name: 'dbus' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/dbus' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Message bus system, providing inter-application communication' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/dbus/package.yml' as const,
  homepageUrl: 'https://wiki.freedesktop.org/www/Software/dbus' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install freedesktop.org/dbus' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/dbus -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/dbus' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dbus-cleanup-sockets',
    'dbus-daemon',
    'dbus-launch',
    'dbus-monitor',
    'dbus-run-session',
    'dbus-send',
    'dbus-test-tool',
    'dbus-update-activation-environment',
    'dbus-uuidgen',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'pagure.io/xmlto',
    'libexpat.github.io',
    'mesonbuild.com',
    'darwin:gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.16.2',
    '1.16.0',
    '1.15.92',
    '1.15.90',
    '1.15.12',
    '1.15.10',
    '1.15.8',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgdbusPackage = typeof freedesktoporgdbusPackage
