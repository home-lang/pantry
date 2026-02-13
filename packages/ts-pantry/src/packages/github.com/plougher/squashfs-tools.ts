/**
 * **SquashFS-Tools** - tools to create and extract Squashfs filesystems
 *
 * @domain `github.com/plougher/squashfs-tools`
 * @programs `mksquashfs`, `unsquashfs`, `sqfscat`, `sqfstar`
 * @version `4.7.4` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/plougher/squashfs-tools`
 * @dependencies `lz4.org@1`, `oberhumer.com/lzo@2`, `tukaani.org/xz@5`, ... (+2 more)
 * @buildDependencies `curl.se`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomploughersquashfstools
 * console.log(pkg.name)        // "SquashFS-Tools"
 * console.log(pkg.description) // "tools to create and extract Squashfs filesystems"
 * console.log(pkg.programs)    // ["mksquashfs", "unsquashfs", ...]
 * console.log(pkg.versions[0]) // "4.7.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/plougher/squashfs-tools.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const squashfstoolsPackage = {
  /**
   * The display name of this package.
   */
  name: 'SquashFS-Tools' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/plougher/squashfs-tools' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'tools to create and extract Squashfs filesystems' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/plougher/squashfs-tools/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/plougher/squashfs-tools' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/plougher/squashfs-tools' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/plougher/squashfs-tools -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/plougher/squashfs-tools' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mksquashfs',
    'unsquashfs',
    'sqfscat',
    'sqfstar',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'lz4.org@1',
    'oberhumer.com/lzo@2',
    'tukaani.org/xz@5',
    'facebook.com/zstd@1',
    'zlib.net@1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.7.4',
    '4.7.3',
    '4.7.2',
    '4.7.1',
    '4.7.0',
    '4.6.1',
  ] as const,
  aliases: [] as const,
}

export type SquashfstoolsPackage = typeof squashfstoolsPackage
