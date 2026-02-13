/**
 * **meson** - Fast and user friendly build system
 *
 * @domain `mesonbuild.com`
 * @programs `meson`
 * @version `1.10.1` (36 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mesonbuild.com`
 * @homepage https://mesonbuild.com/
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mesonbuildcom
 * console.log(pkg.name)        // "meson"
 * console.log(pkg.description) // "Fast and user friendly build system"
 * console.log(pkg.programs)    // ["meson"]
 * console.log(pkg.versions[0]) // "1.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mesonbuild-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mesonbuildcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'meson' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mesonbuild.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fast and user friendly build system' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mesonbuild.com/package.yml' as const,
  homepageUrl: 'https://mesonbuild.com/' as const,
  githubUrl: 'https://github.com/mesonbuild/meson' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mesonbuild.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mesonbuild.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mesonbuild.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'meson',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.10.1',
    '1.10.0',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.5',
    '1.8.4',
    '1.8.3',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.1',
    '1.6.0',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.3',
    '1.2.2',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.64.1',
    '0.64.0',
    '0.63.3',
  ] as const,
  aliases: [] as const,
}

export type MesonbuildcomPackage = typeof mesonbuildcomPackage
