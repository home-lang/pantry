/**
 * **bw** - Secure and free password manager for all of your devices
 *
 * @domain `bitwarden.com`
 * @programs `bw`
 * @version `2025.12.1` (33 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install bitwarden.com`
 * @homepage https://bitwarden.com/
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com`, `linux:python.org@^3` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.bitwardencom
 * console.log(pkg.name)        // "bw"
 * console.log(pkg.description) // "Secure and free password manager for all of you..."
 * console.log(pkg.programs)    // ["bw"]
 * console.log(pkg.versions[0]) // "2025.12.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/bitwarden-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const bitwardencomPackage = {
  /**
   * The display name of this package.
   */
  name: 'bw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'bitwarden.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Secure and free password manager for all of your devices' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/bitwarden.com/package.yml' as const,
  homepageUrl: 'https://bitwarden.com/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install bitwarden.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bitwarden.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install bitwarden.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bw',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org^20',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'npmjs.com',
    'linux:python.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2025.12.1',
    '2025.12.0',
    '2025.11.0',
    '2025.10.0',
    '2025.9.0',
    '2025.8.0',
    '2025.7.0',
    '2025.6.1',
    '2025.6.0',
    '2025.4.0',
    '2025.3.0',
    '2025.2.0',
    '2025.1.3',
    '2025.1.2',
    '2025.1.1',
    '2025.1.0',
    '2024.12.0',
    '2024.11.1',
    '2024.11.0',
    '2024.10.0',
    '2024.9.0',
    '2024.8.2',
    '2024.8.1',
    '2024.7.2',
    '2024.7.1',
    '2024.6.1',
    '2024.6.0',
    '2024.4.1',
    '2024.4.0',
    '2024.3.1',
    '2024.2.1',
    '2024.2.0',
    '1.22.1',
  ] as const,
  aliases: [] as const,
}

export type BitwardencomPackage = typeof bitwardencomPackage
