/**
 * **v** - Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io
 *
 * @domain `vlang.io`
 * @programs `v`
 * @version `0.5.1` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install vlang.io`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.vlangio
 * console.log(pkg.name)        // "v"
 * console.log(pkg.description) // "Simple, fast, safe, compiled language for devel..."
 * console.log(pkg.programs)    // ["v"]
 * console.log(pkg.versions[0]) // "0.5.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/vlang-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const vlangioPackage = {
  /**
  * The display name of this package.
  */
  name: 'v' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'vlang.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vlang.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/vlang/v' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install vlang.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vlang.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install vlang.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'v',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    'weekly.2026.08',
    'weekly.2026.07',
    'weekly.2026.06',
    'weekly.2026.05',
    'weekly.2026.04',
    'weekly.2026.03',
    'weekly.2026.02',
    'weekly.2025.52',
    'weekly.2025.51',
    'weekly.2025.50',
    'weekly.2025.49',
    'weekly.2025.48',
    'weekly.2025.47',
    'weekly.2025.46',
    'weekly.2025.45',
    'weekly.2025.44',
    'weekly.2025.43',
    'weekly.2025.42',
    'weekly.2025.41',
    'weekly.2025.40',
  ] as const,
  aliases: [] as const,
}

export type VlangioPackage = typeof vlangioPackage
