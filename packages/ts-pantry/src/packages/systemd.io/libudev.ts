/**
 * **libudev** - Native libudev shared library and development interface.
 *
 * @domain `systemd.io/libudev`
 * @version `262.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install systemd.io/libudev`
 * @name `libudev`
 * @homepage https://systemd.io/
 * @buildDependencies `mesonbuild.com`, `ninja-build.org`, `freedesktop.org/pkg-config`, ... (+6 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access the package
 * const pkg = pantry.libudev
 * // Or access via domain
 * const samePkg = pantry.systemdiolibudev
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "libudev"
 * console.log(pkg.description) // "Native libudev shared library and development i..."
 * console.log(pkg.versions[0]) // "262.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/systemd-io/libudev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const libudevPackage = {
  /**
  * The display name of this package.
  */
  name: 'libudev' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'systemd.io/libudev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Native libudev shared library and development interface.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://systemd.io/' as const,
  githubUrl: 'https://github.com/systemd/systemd' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install systemd.io/libudev' as const,
  pantryInstallCommand: 'pantry install systemd.io/libudev' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
    'ninja-build.org',
    'freedesktop.org/pkg-config',
    'python.org~3.12',
    'palletsprojects.com/jinja^3',
    'gnu.org/gperf',
    'gnu.org/coreutils',
    'gnu.org/binutils',
    'kernel.org/linux-headers',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '262.1',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [] as const,
}

export type LibudevPackage = typeof libudevPackage
