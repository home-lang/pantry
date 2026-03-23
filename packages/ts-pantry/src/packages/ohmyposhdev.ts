/**
 * **oh-my-posh** - The most customisable and low-latency cross platform/shell prompt renderer
 *
 * @domain `ohmyposh.dev`
 * @programs `oh-my-posh`
 * @version `29.9.1` (386 versions available)
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
 * console.log(pkg.versions[0]) // "29.9.1" (latest)
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
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ohmyposh.dev -- $SHELL -i' as const,
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
  ] as const,
  aliases: [] as const,
}

export type OhmyposhdevPackage = typeof ohmyposhdevPackage
