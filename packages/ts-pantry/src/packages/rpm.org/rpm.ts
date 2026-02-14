/**
 * **rpm** - pkgx package
 *
 * @domain `rpm.org/rpm`
 * @version `6.0.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rpm.org/rpm`
 * @dependencies `lua.org^5.2`, `gnu.org/gmp`, `libarchive.org`, ... (+9 more)
 * @buildDependencies `cmake.org@^3.18`, `lua.org@5.4`, `gnu.org/gettext`, ... (+6 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rpmorgrpm
 * console.log(pkg.name)        // "rpm"
 * console.log(pkg.versions[0]) // "6.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rpm-org/rpm.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rpmorgrpmPackage = {
  /**
  * The display name of this package.
  */
  name: 'rpm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rpm.org/rpm' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rpm.org/rpm/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rpm.org/rpm' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rpm.org/rpm -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rpm.org/rpm' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'lua.org^5.2',
    'gnu.org/gmp',
    'libarchive.org',
    'darwinsys.com/file',
    'rpm.org/popt',
    'gnu.org/readline',
    'sqlite.org',
    'tukaani.org/xz',
    'facebook.com/zstd',
    'gnu.org/nettle@3',
    'elfutils.org',
    'gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3.18',
    'lua.org@5.4',
    'gnu.org/gettext',
    'python.org@>=3.10',
    'sr.ht/scdoc',
    'curl.se',
    'gnu.org/tar',
    'gnu.org/gcc@14',
    'gnu.org/binutils@~2.44',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.0.1',
  ] as const,
  aliases: [] as const,
}

export type RpmorgrpmPackage = typeof rpmorgrpmPackage
