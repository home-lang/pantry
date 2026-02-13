/**
 * **pkg-config** - package compiler and linker metadata toolkit
 *
 * @domain `freedesktop.org/pkg-config`
 * @programs `pkg-config`
 * @version `0.29.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/pkg-config`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgpkgconfig
 * console.log(pkg.name)        // "pkg-config"
 * console.log(pkg.description) // "package compiler and linker metadata toolkit"
 * console.log(pkg.programs)    // ["pkg-config"]
 * console.log(pkg.versions[0]) // "0.29.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/pkg-config.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgpkgconfigPackage = {
  /**
   * The display name of this package.
   */
  name: 'pkg-config' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/pkg-config' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'package compiler and linker metadata toolkit' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/pkg-config/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/pkgconf/pkgconf' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/pkg-config' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/pkg-config -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/pkg-config' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pkg-config',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.29.2',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgpkgconfigPackage = typeof freedesktoporgpkgconfigPackage
