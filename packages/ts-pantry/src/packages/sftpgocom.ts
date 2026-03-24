/**
 * **sftpgo** - Full-featured and highly configurable SFTP, HTTP/S, FTP/S and WebDAV server - S3, Google Cloud Storage, Azure Blob
 *
 * @domain `sftpgo.com`
 * @programs `sftpgo`
 * @version `2.7.1` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sftpgo.com`
 * @homepage https://sftpgo.com
 * @buildDependencies `go.dev@=1.22.2`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.sftpgocom
 * console.log(pkg.name)        // "sftpgo"
 * console.log(pkg.description) // "Full-featured and highly configurable SFTP, HTT..."
 * console.log(pkg.programs)    // ["sftpgo"]
 * console.log(pkg.versions[0]) // "2.7.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sftpgo-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const sftpgocomPackage = {
  /**
  * The display name of this package.
  */
  name: 'sftpgo' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sftpgo.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Full-featured and highly configurable SFTP, HTTP/S, FTP/S and WebDAV server - S3, Google Cloud Storage, Azure Blob' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sftpgo.com/package.yml' as const,
  homepageUrl: 'https://sftpgo.com' as const,
  githubUrl: 'https://github.com/drakkan/sftpgo' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sftpgo.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sftpgo.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install sftpgo.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sftpgo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@=1.22.2',
    'gnu.org/coreutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.7.1',
    '2.7.0',
    '2.6.6',
    '2.6.5',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.6',
    '2.5.5',
    '2.5.4',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
    '2.4.6',
    '2.4.5',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.6',
    '2.3.5',
    '2.3.4',
    '2.3.3',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.0',
    '0.9.6',
    '0.9.5',
  ] as const,
  aliases: [] as const,
}

export type SftpgocomPackage = typeof sftpgocomPackage
