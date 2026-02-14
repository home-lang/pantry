/**
 * **at-spi2-atk** - pkgx package
 *
 * @domain `freedesktop.org/at-spi2-atk`
 * @version `2.38.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/at-spi2-atk`
 * @dependencies `gnome.org/atk`, `gnome.org/libxml2`, `freedesktop.org/dbus`, ... (+1 more)
 * @buildDependencies `mesonbuild.com`, `python.org@~3.11`, `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgatspi2atk
 * console.log(pkg.name)        // "at-spi2-atk"
 * console.log(pkg.versions[0]) // "2.38.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/at-spi2-atk.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgatspi2atkPackage = {
  /**
  * The display name of this package.
  */
  name: 'at-spi2-atk' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/at-spi2-atk' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/at-spi2-atk/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install freedesktop.org/at-spi2-atk' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/at-spi2-atk -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/at-spi2-atk' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/atk',
    'gnome.org/libxml2',
    'freedesktop.org/dbus',
    'x.org/xtst',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'mesonbuild.com',
    'python.org@~3.11',
    'linux:llvm.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.38.0',
  ] as const,
  aliases: [] as const,
}

export type Freedesktoporgatspi2atkPackage = typeof freedesktoporgatspi2atkPackage
