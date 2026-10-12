/**
 * **oh-my-posh** - The most customisable and low-latency cross platform/shell prompt renderer
 *
 * @domain `ohmyposh.dev`
 * @programs `oh-my-posh`
 * @version `31.8.0` (125 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ohmyposh.dev`
 * @homepage https://ohmyposh.dev
 * @buildDependencies `go.dev@>=1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.ohmyposhdev
 * console.log(pkg.name)        // "oh-my-posh"
 * console.log(pkg.description) // "The most customisable and low-latency cross pla..."
 * console.log(pkg.programs)    // ["oh-my-posh"]
 * console.log(pkg.versions[0]) // "31.8.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/ohmyposh-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const ohmyposhdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'oh-my-posh' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ohmyposh.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The most customisable and low-latency cross platform/shell prompt renderer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ohmyposh.dev/package.yml' as const,
  homepageUrl: 'https://ohmyposh.dev' as const,
  githubUrl: 'https://github.com/JanDeDobbeleer/oh-my-posh' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install ohmyposh.dev' as const,
  pantryInstallCommand: 'pantry install ohmyposh.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'oh-my-posh',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@>=1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '31.8.0',
    '31.7.0',
    '31.6.0',
    '31.5.0',
    '31.4.1',
    '31.4.0',
    '31.3.0',
    '31.2.1',
    '31.2.0',
    '31.1.3',
    '31.1.2',
    '31.1.1',
    '31.1.0',
    '31.0.0',
    '30.9.0',
    '30.8.1',
    '30.8.0',
    '30.7.0',
    '30.6.5',
    '30.6.4',
    '30.6.3',
    '30.6.2',
    '30.6.1',
    '30.6.0',
    '30.5.0',
    '30.4.0',
    '30.3.0',
    '30.2.0',
    '30.1.1',
    '30.1.0',
    '30.0.0',
    '29.37.0',
    '29.36.1',
    '29.36.0',
    '29.35.3',
    '29.35.2',
    '29.35.1',
    '29.35.0',
    '29.34.0',
    '29.33.0',
    '29.32.0',
    '29.31.1',
    '29.31.0',
    '29.30.0',
    '29.29.0',
    '29.28.0',
    '29.27.0',
    '29.26.1',
    '29.26.0',
    '29.25.1',
    '29.25.0',
    '29.24.1',
    '29.24.0',
    '29.23.0',
    '29.22.1',
    '29.22.0',
    '29.21.0',
    '29.20.1',
    '29.20.0',
    '29.19.1',
    '29.19.0',
    '29.18.0',
    '29.17.0',
    '29.16.0',
    '29.15.1',
    '29.15.0',
    '29.14.0',
    '29.13.1',
    '29.13.0',
    '29.12.0',
    '29.11.0',
    '29.10.0',
    '29.9.4',
    '29.9.3',
    '29.9.2',
    '29.9.1',
    '29.9.0',
    '29.8.0',
    '29.7.1',
    '29.7.0',
    '29.6.1',
    '29.6.0',
    '29.5.0',
    '29.4.1',
    '29.4.0',
    '29.3.0',
    '29.2.2',
    '29.2.1',
    '29.2.0',
    '29.1.0',
    '29.0.2',
    '29.0.1',
    '29.0.0',
    '28.10.0',
    '28.9.0',
    '28.8.1',
    '28.8.0',
    '28.7.0',
    '28.6.0',
    '28.5.1',
    '28.5.0',
    '28.4.0',
    '28.3.1',
    '28.3.0',
    '28.2.2',
    '28.2.1',
    '28.2.0',
    '28.1.1',
    '28.1.0',
    '28.0.0',
    '27.6.0',
    '27.5.2',
    '27.5.1',
    '27.5.0',
    '27.4.4',
    '27.4.3',
    '27.4.2',
    '27.4.1',
    '27.4.0',
    '27.3.1',
    '27.3.0',
    '27.2.1',
    '27.2.0',
    '27.1.2',
    '27.1.1',
  ] as const,
  aliases: [] as const,
}

export type OhmyposhdevPackage = typeof ohmyposhdevPackage
