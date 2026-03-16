/**
 * **dnf5** - pkgx package
 *
 * @domain `rpm.org/dnf5`
 * @programs `dnf5`
 * @version `5.4.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install rpm.org/dnf5`
 * @dependencies `rpm.org/rpm`, `rpm.org/libdnf5`, `rpm.org/librepo`, ... (+13 more)
 * @buildDependencies `cmake.org@>=3.16`, `gnu.org/gcc@^14`, `python.org@>=3.9`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.rpmorgdnf5
 * console.log(pkg.name)        // "dnf5"
 * console.log(pkg.programs)    // ["dnf5"]
 * console.log(pkg.versions[0]) // "5.4.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/rpm-org/dnf5.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const rpmorgdnf5Package = {
  /**
  * The display name of this package.
  */
  name: 'dnf5' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rpm.org/dnf5' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rpm.org/dnf5/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install rpm.org/dnf5' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rpm.org/dnf5 -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install rpm.org/dnf5' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dnf5',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'rpm.org/rpm',
    'rpm.org/libdnf5',
    'rpm.org/librepo',
    'rpm.org/popt',
    'opensuse.org/libsolv',
    'github.com/json-c/json-c',
    'gnome.org/glib',
    'gnome.org/libxml2',
    'pcre.org/v2',
    'sourceware.org/libffi',
    'fmt.dev',
    'savannah.nongnu.org/acl',
    'curl.se',
    'openssl.org',
    'sqlite.org',
    'github.com/util-linux/util-linux',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@>=3.16',
    'gnu.org/gcc@^14',
    'python.org@>=3.9',
    'gnu.org/gettext',
    'doxygen.nl',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '5.4.0.0',
  ] as const,
  aliases: [] as const,
}

export type Rpmorgdnf5Package = typeof rpmorgdnf5Package
