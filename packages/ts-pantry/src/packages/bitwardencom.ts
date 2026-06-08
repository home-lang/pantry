/**
 * **bw** - Secure and free password manager for all of your devices
 *
 * @domain `bitwarden.com`
 * @programs `bw`
 * @version `2026.2.0` (35 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install bitwarden.com`
 * @homepage https://bitwarden.com/
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com`, `linux:python.org@^3` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.bitwardencom
 * console.log(pkg.name)        // "bw"
 * console.log(pkg.description) // "Secure and free password manager for all of you..."
 * console.log(pkg.programs)    // ["bw"]
 * console.log(pkg.versions[0]) // "2026.2.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/bitwarden-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install bitwarden.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bitwarden.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install bitwarden.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2026.5.0',
    '2026.4.2',
    '2026.4.1',
    '2026.3.0',
    '2026.2.0',
    '2026.1.0',
    '2025.12.1',
    '2025.12.0',
    '2025.11.0',
    '2025.10.0',
    '2025.9.0',
    '2025.8.0',
    '2025.7.0',
    '2025.6.1',
    '2025.6.0',
    '2025.5.0',
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
    '2024.8.0',
    '2024.7.2',
    '2024.7.1',
    '2024.6.1',
    '2024.6.0',
    '2024.4.1',
    '2024.4.0',
    '2024.3.1',
    '2024.2.1',
    '2024.2.0',
    '2024.1.0',
    '2023.12.1',
    '2023.12.0',
    '2023.10.0',
    '2023.9.1',
    '2023.9.0',
    '2023.8.2',
    '2023.7.0',
    '2023.5.0',
    '2023.4.0',
    '2023.3.0',
    '2023.2.0',
    '2023.1.0',
    '2022.11.0',
    '2022.10.0',
    '2022.9.0',
    '2022.8.0',
    '2022.6.2',
    '2022.6.1',
    '2022.6.0',
    '1.22.1',
    '1.22.0',
    '1.21.1',
    '1.21.0',
    '1.20.0',
    '1.19.1',
    '1.19.0',
    '1.18.1',
    '1.18.0',
    '1.17.1',
    '1.17.0',
    '1.16.0',
    '1.15.1',
    '1.15.0',
    '1.14.0',
    '1.13.3',
    '1.13.2',
    '1.13.1',
    '1.12.1',
    '1.12.0',
    '1.11.0',
    '1.10.0',
    '1.9.1',
    '1.9.0',
    '1.8.0',
    '1.7.4',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.3.1',
    '0.3.0',
    '0.2.1',
    '0.2.0',
    '0.1.2',
    '0.1.1',
    '0.1.0',
    '0.0.5',
    '0.0.4',
    '0.0.3',
    '0.0.2',
    '0.0.1',
  ] as const,
  aliases: [] as const,
}

export type BitwardencomPackage = typeof bitwardencomPackage
