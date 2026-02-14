/**
 * **borg** - Deduplicating archiver with compression and authenticated encryption.
 *
 * @domain `borgbackup.org`
 * @programs `borg`, `borgfs`
 * @version `1.4.3` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install borgbackup.org`
 * @homepage https://www.borgbackup.org/
 * @dependencies `pkgx.sh>=1`, `github.com/Cyan4973/xxHash^0.8`
 * @buildDependencies `python.org@^3.10`, `openssl.org@^1.1`, `facebook.com/zstd`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.borgbackuporg
 * console.log(pkg.name)        // "borg"
 * console.log(pkg.description) // "Deduplicating archiver with compression and aut..."
 * console.log(pkg.programs)    // ["borg", "borgfs"]
 * console.log(pkg.versions[0]) // "1.4.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/borgbackup-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const borgbackuporgPackage = {
  /**
  * The display name of this package.
  */
  name: 'borg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'borgbackup.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Deduplicating archiver with compression and authenticated encryption.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/borgbackup.org/package.yml' as const,
  homepageUrl: 'https://www.borgbackup.org/' as const,
  githubUrl: 'https://github.com/borgbackup/borg' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install borgbackup.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +borgbackup.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install borgbackup.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'borg',
    'borgfs',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
    'github.com/Cyan4973/xxHash^0.8',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'python.org@^3.10',
    'openssl.org@^1.1',
    'facebook.com/zstd',
    'lz4.org',
    'linux:savannah.nongnu.org/acl@^2.3.1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.2.9',
  ] as const,
  aliases: [] as const,
}

export type BorgbackuporgPackage = typeof borgbackuporgPackage
