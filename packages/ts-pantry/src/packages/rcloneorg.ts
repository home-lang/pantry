/**
 * **rclone** - "rsync for cloud storage" - Google Drive, S3, Dropbox, Backblaze B2, One Drive, Swift, Hubic, Wasabi, Google Cloud Storage, Azure Blob, Azure Files, Yandex Files
 *
 * @domain `rclone.org`
 * @programs `rclone`
 * @version `1.73.1` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rclone.org`
 * @homepage https://rclone.org/
 * @buildDependencies `go.dev`, `darwin:curl.se`, `darwin:gnu.org/patch` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rcloneorg
 * console.log(pkg.name)        // "rclone"
 * console.log(pkg.description) // ""rsync for cloud storage" - Google Drive, S3, D..."
 * console.log(pkg.programs)    // ["rclone"]
 * console.log(pkg.versions[0]) // "1.73.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rclone-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rcloneorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'rclone' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rclone.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '"rsync for cloud storage" - Google Drive, S3, Dropbox, Backblaze B2, One Drive, Swift, Hubic, Wasabi, Google Cloud Storage, Azure Blob, Azure Files, Yandex Files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rclone.org/package.yml' as const,
  homepageUrl: 'https://rclone.org/' as const,
  githubUrl: 'https://github.com/rclone/rclone' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rclone.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rclone.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rclone.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rclone',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'go.dev',
    'darwin:curl.se',
    'darwin:gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.73.1',
    '1.73.0',
    '1.72.1',
    '1.72.0',
    '1.71.2',
    '1.71.1',
    '1.71.0',
    '1.70.3',
    '1.70.2',
    '1.70.1',
    '1.70.0',
    '1.69.3',
    '1.69.2',
    '1.69.1',
    '1.69.0',
    '1.68.2',
    '1.68.1',
    '1.68.0',
    '1.67.0',
    '1.66.0',
    '1.65.2',
    '1.65.1',
    '1.65.0',
    '1.64.2',
    '1.64.1',
    '1.64.0',
    '1.63.1',
  ] as const,
  aliases: [] as const,
}

export type RcloneorgPackage = typeof rcloneorgPackage
