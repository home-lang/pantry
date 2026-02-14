/**
 * **aria2c** - aria2 is a lightweight multi-protocol & multi-source, cross platform download utility operated in command-line. It supports HTTP/HTTPS, FTP, SFTP, BitTorrent and Metalink.
 *
 * @domain `aria2.github.io`
 * @programs `aria2c`
 * @version `1.37.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install aria2.github.io`
 * @homepage https://aria2.github.io/
 * @dependencies `zlib.net^1`, `openssl.org^1`, `libexpat.github.io`, ... (+1 more)
 * @buildDependencies `gnupg.org/libgcrypt@^1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.aria2githubio
 * console.log(pkg.name)        // "aria2c"
 * console.log(pkg.description) // "aria2 is a lightweight multi-protocol & multi-s..."
 * console.log(pkg.programs)    // ["aria2c"]
 * console.log(pkg.versions[0]) // "1.37.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/aria2-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const aria2githubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'aria2c' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'aria2.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'aria2 is a lightweight multi-protocol & multi-source, cross platform download utility operated in command-line. It supports HTTP/HTTPS, FTP, SFTP, BitTorrent and Metalink.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/aria2.github.io/package.yml' as const,
  homepageUrl: 'https://aria2.github.io/' as const,
  githubUrl: 'https://github.com/aria2/aria2' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install aria2.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +aria2.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install aria2.github.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'aria2c',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net^1',
    'openssl.org^1',
    'libexpat.github.io',
    'sqlite.org^3',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnupg.org/libgcrypt@^1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.37.0',
    '1.36.0',
  ] as const,
  aliases: [] as const,
}

export type Aria2githubioPackage = typeof aria2githubioPackage
