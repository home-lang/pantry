/**
 * **dotnet** - Home of .NET's Virtual Monolithic Repository which includes all the code needed to build the .NET SDK from source
 *
 * @domain `dotnet.microsoft.com`
 * @programs `dotnet`
 * @version `10.0.102` (45 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dotnet.microsoft.com`
 * @homepage https://dotnet.microsoft.com/
 * @dependencies `linux:unicode.org^71`, `linux:openssl.org` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dotnetmicrosoftcom
 * console.log(pkg.name)        // "dotnet"
 * console.log(pkg.description) // "Home of .NET's Virtual Monolithic Repository wh..."
 * console.log(pkg.programs)    // ["dotnet"]
 * console.log(pkg.versions[0]) // "10.0.102" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dotnet-microsoft-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dotnetmicrosoftcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'dotnet' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'dotnet.microsoft.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Home of .NET\'s Virtual Monolithic Repository which includes all the code needed to build the .NET SDK from source' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dotnet.microsoft.com/package.yml' as const,
  homepageUrl: 'https://dotnet.microsoft.com/' as const,
  githubUrl: 'https://github.com/dotnet/dotnet' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install dotnet.microsoft.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dotnet.microsoft.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dotnet.microsoft.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dotnet',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:unicode.org^71',
    'linux:openssl.org',
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
    '10.0.102',
    '10.0.101',
    '9.0.310',
    '9.0.309',
    '9.0.308',
    '9.0.306',
    '9.0.303',
    '9.0.202',
    '9.0.113',
    '9.0.111',
    '9.0.102',
    '9.0.100',
    '8.0.417',
    '8.0.415',
    '8.0.410',
    '8.0.405',
    '8.0.403',
    '8.0.402',
    '8.0.401',
    '8.0.318',
    '8.0.313',
    '8.0.308',
    '8.0.303',
    '8.0.302',
    '8.0.301',
    '8.0.206',
    '8.0.204',
    '8.0.203',
    '8.0.121',
    '8.0.112',
    '8.0.107',
    '8.0.106',
    '8.0.104',
    '8.0.101',
    '8.0.100',
    '7.0.404',
    '7.0.306',
    '7.0.120',
    '6.0.424',
    '6.0.423',
    '6.0.422',
    '6.0.417',
    '6.0.132',
    '6.0.131',
    '6.0.130',
  ] as const,
  aliases: [] as const,
}

export type DotnetmicrosoftcomPackage = typeof dotnetmicrosoftcomPackage
