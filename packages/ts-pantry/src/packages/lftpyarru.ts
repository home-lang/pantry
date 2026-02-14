/**
 * **lftp** - sophisticated command line file transfer program (ftp, http, sftp, fish, torrent)
 *
 * @domain `lftp.yar.ru`
 * @programs `lftp`, `lftpget`
 * @version `4.9.3` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lftp.yar.ru`
 * @homepage https://lftp.yar.ru/
 * @dependencies `gnu.org/libidn2`, `gnu.org/gettext`, `gnu.org/readline`, ... (+5 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `linux:gnu.org/gcc@14` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.lftpyarru
 * console.log(pkg.name)        // "lftp"
 * console.log(pkg.description) // "sophisticated command line file transfer progra..."
 * console.log(pkg.programs)    // ["lftp", "lftpget"]
 * console.log(pkg.versions[0]) // "4.9.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lftp-yar-ru.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lftpyarruPackage = {
  /**
  * The display name of this package.
  */
  name: 'lftp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'lftp.yar.ru' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'sophisticated command line file transfer program (ftp, http, sftp, fish, torrent)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lftp.yar.ru/package.yml' as const,
  homepageUrl: 'https://lftp.yar.ru/' as const,
  githubUrl: 'https://github.com/lavv17/lftp' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install lftp.yar.ru' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lftp.yar.ru -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lftp.yar.ru' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'lftp',
    'lftpget',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'gnu.org/libidn2',
    'gnu.org/gettext',
    'gnu.org/readline',
    'openssl.org^1.1',
    'zlib.net',
    'invisible-island.net/ncurses',
    'libexpat.github.io',
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc@14',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.9.3',
    '4.9.2',
    '4.9.1',
  ] as const,
  aliases: [] as const,
}

export type LftpyarruPackage = typeof lftpyarruPackage
