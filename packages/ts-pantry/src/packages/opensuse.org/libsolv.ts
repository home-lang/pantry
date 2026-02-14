/**
 * **libsolv** - pkgx package
 *
 * @domain `opensuse.org/libsolv`
 * @version `0.7.35` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install opensuse.org/libsolv`
 * @dependencies `zlib.net`, `tukaani.org/xz`, `sourceware.org/bzip2`, ... (+3 more)
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.opensuseorglibsolv
 * console.log(pkg.name)        // "libsolv"
 * console.log(pkg.versions[0]) // "0.7.35" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/opensuse-org/libsolv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const opensuseorglibsolvPackage = {
  /**
  * The display name of this package.
  */
  name: 'libsolv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'opensuse.org/libsolv' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/opensuse.org/libsolv/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install opensuse.org/libsolv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opensuse.org/libsolv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install opensuse.org/libsolv' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net',
    'tukaani.org/xz',
    'sourceware.org/bzip2',
    'facebook.com/zstd',
    'libexpat.github.io',
    'rpm.org/rpm',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.7.35',
  ] as const,
  aliases: [] as const,
}

export type OpensuseorglibsolvPackage = typeof opensuseorglibsolvPackage
