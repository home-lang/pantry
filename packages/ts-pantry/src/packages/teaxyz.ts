/**
 * **tea/cli** - Run Anything
 *
 * @domain `tea.xyz`
 * @version `0.39.6` (143 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install tea.xyz`
 * @homepage https://pkgx.sh
 * @buildDependencies `deno.land@>=1.23 <1.25 || ^1.25.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.teaxyz
 * console.log(pkg.name)        // "tea/cli"
 * console.log(pkg.description) // "Run Anything"
 * console.log(pkg.versions[0]) // "0.39.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/tea-xyz.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const teaxyzPackage = {
  /**
  * The display name of this package.
  */
  name: 'tea/cli' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tea.xyz' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Run Anything' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tea.xyz/package.yml' as const,
  homepageUrl: 'https://pkgx.sh' as const,
  githubUrl: 'https://github.com/teaxyz/cli' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install tea.xyz' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tea.xyz -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install tea.xyz' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'deno.land@>=1.23 <1.25 || ^1.25.3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.10.0',
    '2.9.0',
    '2.8.0',
    '2.7.0',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.4',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.0',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.1',
    '1.3.0',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.6',
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.39.6',
    '0.39.5',
    '0.39.4',
    '0.39.3',
    '0.39.2',
    '0.39.1',
    '0.39.0',
    '0.38.4',
    '0.38.3',
  ] as const,
  aliases: [] as const,
}

export type TeaxyzPackage = typeof teaxyzPackage
