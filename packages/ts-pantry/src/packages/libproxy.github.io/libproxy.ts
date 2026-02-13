/**
 * **libproxy** - Library that provides automatic proxy configuration management
 *
 * @domain `libproxy.github.io/libproxy`
 * @programs `proxy`
 * @version `0.5.12` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libproxy.github.io/libproxy`
 * @homepage https://libproxy.github.io/libproxy/
 * @dependencies `duktape.org`, `gnome.org/glib`, `curl.se`, ... (+2 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `mesonbuild.com`, `gnome.org/vala` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libproxygithubiolibproxy
 * console.log(pkg.name)        // "libproxy"
 * console.log(pkg.description) // "Library that provides automatic proxy configura..."
 * console.log(pkg.programs)    // ["proxy"]
 * console.log(pkg.versions[0]) // "0.5.12" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libproxy-github-io/libproxy.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libproxygithubiolibproxyPackage = {
  /**
   * The display name of this package.
   */
  name: 'libproxy' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libproxy.github.io/libproxy' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Library that provides automatic proxy configuration management' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libproxy.github.io/libproxy/package.yml' as const,
  homepageUrl: 'https://libproxy.github.io/libproxy/' as const,
  githubUrl: 'https://github.com/libproxy/libproxy' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libproxy.github.io/libproxy' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libproxy.github.io/libproxy -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libproxy.github.io/libproxy' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'proxy',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'duktape.org',
    'gnome.org/glib',
    'curl.se',
    'linux:freedesktop.org/dbus',
    'linux:llvm.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
    'gnome.org/vala',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.12',
    '0.5.11',
    '0.5.10',
    '0.5.9',
    '0.5.8',
    '0.5.7',
    '0.5.6',
    '0.5.5',
    '0.5.4',
    '0.5.3',
  ] as const,
  aliases: [] as const,
}

export type LibproxygithubiolibproxyPackage = typeof libproxygithubiolibproxyPackage
