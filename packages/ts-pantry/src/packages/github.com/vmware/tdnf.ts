/**
 * **tdnf** - pkgx package
 *
 * @domain `github.com/vmware/tdnf`
 * @version `3.6.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/vmware/tdnf`
 * @dependencies `rpm.org/rpm`, `libexpat.github.io`, `sqlite.org@3`, ... (+5 more)
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomvmwaretdnf
 * console.log(pkg.name)        // "tdnf"
 * console.log(pkg.versions[0]) // "3.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/vmware/tdnf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tdnfPackage = {
  /**
  * The display name of this package.
  */
  name: 'tdnf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/vmware/tdnf' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/vmware/tdnf/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/vmware/tdnf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/vmware/tdnf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/vmware/tdnf' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'rpm.org/rpm',
    'libexpat.github.io',
    'sqlite.org@3',
    'opensuse.org/libsolv',
    'gnupg.org/gpgme',
    'gnupg.org/libgpg-error',
    'openssl.org~1.1',
    'curl.se',
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
    '3.6.3',
  ] as const,
  aliases: [] as const,
}

export type TdnfPackage = typeof tdnfPackage
