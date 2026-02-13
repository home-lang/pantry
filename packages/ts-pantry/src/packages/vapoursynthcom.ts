/**
 * **vspipe** - A video processing framework with simplicity in mind
 *
 * @domain `vapoursynth.com`
 * @programs `vspipe`
 * @version `73.0.0` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install vapoursynth.com`
 * @homepage https://www.vapoursynth.com
 * @dependencies `python.org~3.11`, `github.com/sekrit-twc/zimg`, `linux:gnu.org/gcc/libstdcxx` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `cython.org`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.vapoursynthcom
 * console.log(pkg.name)        // "vspipe"
 * console.log(pkg.description) // "A video processing framework with simplicity in..."
 * console.log(pkg.programs)    // ["vspipe"]
 * console.log(pkg.versions[0]) // "73.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/vapoursynth-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const vapoursynthcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'vspipe' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'vapoursynth.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A video processing framework with simplicity in mind' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vapoursynth.com/package.yml' as const,
  homepageUrl: 'https://www.vapoursynth.com' as const,
  githubUrl: 'https://github.com/vapoursynth/vapoursynth' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install vapoursynth.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vapoursynth.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install vapoursynth.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'vspipe',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'python.org~3.11',
    'github.com/sekrit-twc/zimg',
    'linux:gnu.org/gcc/libstdcxx',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'cython.org',
    'gnu.org/libtool',
    'nasm.us',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '73.0.0',
    '72.0.0',
    '71.0.0',
    '70.0.0',
    '69.0.0',
    '68.0.0',
    '67.0.0',
    '66.0.0',
    '65.0.0',
    '64.0.0',
  ] as const,
  aliases: [] as const,
}

export type VapoursynthcomPackage = typeof vapoursynthcomPackage
