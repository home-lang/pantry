/**
 * **pwsh** - PowerShell for every system!
 *
 * @domain `microsoft.com/PowerShell`
 * @programs `pwsh`
 * @version `7.5.4` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install microsoft.com/PowerShell`
 * @homepage https://microsoft.com/PowerShell
 * @dependencies `openssl.org^1.1`, `linux:unicode.org^71` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.microsoftcompowershell
 * console.log(pkg.name)        // "pwsh"
 * console.log(pkg.description) // "PowerShell for every system!"
 * console.log(pkg.programs)    // ["pwsh"]
 * console.log(pkg.versions[0]) // "7.5.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/microsoft-com/PowerShell.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const microsoftcompowershellPackage = {
  /**
   * The display name of this package.
   */
  name: 'pwsh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'microsoft.com/PowerShell' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'PowerShell for every system!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/PowerShell/package.yml' as const,
  homepageUrl: 'https://microsoft.com/PowerShell' as const,
  githubUrl: 'https://github.com/PowerShell/PowerShell' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install microsoft.com/PowerShell' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +microsoft.com/PowerShell -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install microsoft.com/PowerShell' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pwsh',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'openssl.org^1.1',
    'linux:unicode.org^71',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.5.4',
    '7.5.3',
    '7.5.2',
    '7.5.1',
    '7.5.0',
    '7.4.13',
    '7.4.12',
    '7.4.11',
    '7.4.10',
    '7.4.7',
    '7.4.5',
    '7.2.24',
  ] as const,
  aliases: [] as const,
}

export type MicrosoftcompowershellPackage = typeof microsoftcompowershellPackage
