/**
 * **tea/cli** - Run Anything
 *
 * @domain `tea.xyz`
 * @version `0.39.6` (143 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tea.xyz`
 * @homepage https://pkgx.sh
 * @buildDependencies `deno.land@>=1.23 <1.25 || ^1.25.3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.teaxyz
 * console.log(pkg.name)        // "tea/cli"
 * console.log(pkg.description) // "Run Anything"
 * console.log(pkg.versions[0]) // "0.39.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tea-xyz.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install tea.xyz' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tea.xyz -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tea.xyz' as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.39.6',
    '0.39.5',
    '0.39.4',
    '0.39.3',
    '0.39.2',
    '0.39.1',
    '0.39.0',
    '0.38.4',
    '0.38.3',
    '0.38.2',
    '0.38.1',
    '0.37.0',
    '0.36.0',
    '0.35.8',
    '0.35.7',
    '0.35.6',
    '0.35.5',
    '0.35.4',
    '0.35.3',
    '0.35.2',
    '0.35.1',
    '0.35.0',
    '0.34.1',
    '0.34.0',
    '0.33.3',
    '0.33.2',
    '0.33.1',
    '0.33.0',
    '0.32.1',
    '0.32.0',
    '0.31.2',
    '0.31.1',
    '0.31.0',
    '0.30.0',
    '0.29.0',
    '0.28.4',
    '0.28.3',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.0',
    '0.26.4',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.3',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.10',
    '0.24.9',
    '0.24.8',
    '0.24.7',
    '0.24.6',
    '0.24.5',
    '0.24.4',
    '0.24.3',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.0',
    '0.22.3',
    '0.22.2',
    '0.22.1',
    '0.22.0',
    '0.21.4',
    '0.21.3',
    '0.21.2',
    '0.21.1',
    '0.21.0',
    '0.20.0',
    '0.19.7',
    '0.19.6',
    '0.19.5',
    '0.19.4',
    '0.19.3',
    '0.19.2',
    '0.19.1',
    '0.19.0',
    '0.18.1',
    '0.18.0',
    '0.17.3',
    '0.17.2',
    '0.17.1',
    '0.17.0',
    '0.16.4',
    '0.16.3',
    '0.16.2',
    '0.16.1',
    '0.16.0',
    '0.15.0',
    '0.14.5',
    '0.14.4',
    '0.14.3',
    '0.14.1',
    '0.14.0',
    '0.13.11',
    '0.13.10',
    '0.13.9',
    '0.13.8',
    '0.13.7',
    '0.13.6',
    '0.13.5',
    '0.13.4',
    '0.13.3',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.1',
    '0.12.0',
    '0.11.14',
    '0.11.13',
    '0.11.11',
    '0.11.10',
    '0.11.9',
    '0.11.8',
    '0.11.6',
    '0.11.5',
    '0.11.4',
    '0.11.3',
    '0.11.2',
    '0.11.1',
    '0.11.0',
    '0.10.8',
    '0.10.7',
    '0.10.6',
    '0.10.5',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.12',
    '0.8.11',
    '0.8.10',
    '0.8.9',
    '0.8.8',
    '0.8.7',
    '0.8.6',
  ] as const,
  aliases: [] as const,
}

export type TeaxyzPackage = typeof teaxyzPackage
