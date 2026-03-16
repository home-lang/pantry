/**
 * **highway** - Performance-portable, length-agnostic SIMD with runtime dispatch
 *
 * @domain `google.com/highway`
 * @version `1.3.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install google.com/highway`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.googlecomhighway
 * console.log(pkg.name)        // "highway"
 * console.log(pkg.description) // "Performance-portable, length-agnostic SIMD with..."
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/google-com/highway.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const googlecomhighwayPackage = {
  /**
  * The display name of this package.
  */
  name: 'highway' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'google.com/highway' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Performance-portable, length-agnostic SIMD with runtime dispatch' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/highway/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/highway' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install google.com/highway' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/highway -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install google.com/highway' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.7',
    '1.0.6',
    '1.0.5',
    '1.0.4',
  ] as const,
  aliases: [] as const,
}

export type GooglecomhighwayPackage = typeof googlecomhighwayPackage
