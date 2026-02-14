/**
 * **e2fsprogs** - Utilities for the ext2, ext3, and ext4 file systems
 *
 * @domain `sourceforge.net/e2fsprogs`
 * @programs `chattr`, `compile_et`, `lsattr`, `mk_cmds`, `uuidgen`
 * @version `1.47.3` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sourceforge.net/e2fsprogs`
 * @homepage https://e2fsprogs.sourceforge.net/
 * @dependencies `darwin:gnu.org/gettext^0.22`, `linux:github.com/util-linux/util-linux^2.39` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sourceforgenete2fsprogs
 * console.log(pkg.name)        // "e2fsprogs"
 * console.log(pkg.description) // "Utilities for the ext2, ext3, and ext4 file sys..."
 * console.log(pkg.programs)    // ["chattr", "compile_et", ...]
 * console.log(pkg.versions[0]) // "1.47.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sourceforge-net/e2fsprogs.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sourceforge.net/e2fsprogs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceforge.net/e2fsprogs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sourceforge.net/e2fsprogs' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'chattr',
    'compile_et',
    'lsattr',
    'mk_cmds',
    'uuidgen',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'darwin:gnu.org/gettext^0.22',
    'linux:github.com/util-linux/util-linux^2.39',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.47.3',
    '1.47.2',
    '1.47.1',
    '1.47.0',
  ] as const,
  aliases: [] as const,
}

export type Sourceforgenete2fsprogsPackage = typeof sourceforgenete2fsprogsPackage
