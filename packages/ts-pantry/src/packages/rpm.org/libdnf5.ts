/**
 * **libdnf5** - pkgx package
 *
 * @domain `rpm.org/libdnf5`
 * @version `5.4.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rpm.org/libdnf5`
 * @dependencies `rpm.org/rpm`, `rpm.org/popt`, `rpm.org/librepo`, ... (+11 more)
 * @buildDependencies `cmake.org@>=3.16`, `gnu.org/gcc@^14`, `gnu.org/gettext`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rpmorglibdnf5
 * console.log(pkg.name)        // "libdnf5"
 * console.log(pkg.versions[0]) // "5.4.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rpm-org/libdnf5.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rpmorglibdnf5Package = {
  /**
  * The display name of this package.
  */
  name: 'libdnf5' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rpm.org/libdnf5' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rpm.org/libdnf5/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rpm.org/libdnf5' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rpm.org/libdnf5 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rpm.org/libdnf5' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'rpm.org/rpm',
    'rpm.org/popt',
    'rpm.org/librepo',
    'gnome.org/glib',
    'opensuse.org/libsolv',
    'github.com/json-c/json-c',
    'openssl.org',
    'sqlite.org',
    'fmt.dev',
    'savannah.nongnu.org/acl',
    'gnome.org/libxml2',
    'pcre.org/v2',
    'sourceware.org/libffi',
    'github.com/util-linux/util-linux',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@>=3.16',
    'gnu.org/gcc@^14',
    'gnu.org/gettext',
    'swig.org',
    'python.org@>=3.9',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.4.0.0',
  ] as const,
  aliases: [] as const,
}

export type Rpmorglibdnf5Package = typeof rpmorglibdnf5Package
