/**
 * **double-conversion** - Efficient binary-decimal and decimal-binary conversion routines for IEEE doubles.
 *
 * @domain `google.com/double-conversion`
 * @version `3.4.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install google.com/double-conversion`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.googlecomdoubleconversion
 * console.log(pkg.name)        // "double-conversion"
 * console.log(pkg.description) // "Efficient binary-decimal and decimal-binary con..."
 * console.log(pkg.versions[0]) // "3.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/google-com/double-conversion.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const googlecomdoubleconversionPackage = {
  /**
  * The display name of this package.
  */
  name: 'double-conversion' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'google.com/double-conversion' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Efficient binary-decimal and decimal-binary conversion routines for IEEE doubles.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/google.com/double-conversion/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/double-conversion' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install google.com/double-conversion' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +google.com/double-conversion -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install google.com/double-conversion' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.1',
  ] as const,
  aliases: [] as const,
}

export type GooglecomdoubleconversionPackage = typeof googlecomdoubleconversionPackage
