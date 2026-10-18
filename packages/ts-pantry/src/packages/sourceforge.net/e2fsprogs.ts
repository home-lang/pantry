/**
 * **e2fsprogs** - Utilities for the ext2, ext3, and ext4 file systems
 *
 * @domain `sourceforge.net/e2fsprogs`
 * @programs `chattr`, `compile_et`, `lsattr`, `mk_cmds`, `mke2fs`, ... (+2 more)
 * @version `1.47.4` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sourceforge.net/e2fsprogs`
 * @homepage https://e2fsprogs.sourceforge.net/
 * @dependencies `darwin:gnu.org/gettext^0.22`, `linux:github.com/util-linux/util-linux^2.39` (includes platform-specific dependencies)
 * @buildDependencies `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.sourceforgenete2fsprogs
 * console.log(pkg.name)        // "e2fsprogs"
 * console.log(pkg.description) // "Utilities for the ext2, ext3, and ext4 file sys..."
 * console.log(pkg.programs)    // ["chattr", "compile_et", ...]
 * console.log(pkg.versions[0]) // "1.47.4" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sourceforge-net/e2fsprogs.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const sourceforgenete2fsprogsPackage = {
  /**
  * The display name of this package.
  */
  name: 'e2fsprogs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sourceforge.net/e2fsprogs' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Utilities for the ext2, ext3, and ext4 file systems' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/e2fsprogs/package.yml' as const,
  homepageUrl: 'https://e2fsprogs.sourceforge.net/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sourceforge.net/e2fsprogs' as const,
  pantryInstallCommand: 'pantry install sourceforge.net/e2fsprogs' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'chattr',
    'compile_et',
    'lsattr',
    'mk_cmds',
    'mke2fs',
    'debugfs',
    'dumpe2fs',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'darwin:gnu.org/gettext^0.22',
    'linux:github.com/util-linux/util-linux^2.39',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/coreutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.47.4',
    '1.47.3',
    '1.47.2',
    '1.47.1',
    '1.47.0',
  ] as const,
  aliases: [] as const,
}

export type Sourceforgenete2fsprogsPackage = typeof sourceforgenete2fsprogsPackage
