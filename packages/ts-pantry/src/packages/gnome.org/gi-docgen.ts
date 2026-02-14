/**
 * **gi-docgen** - pkgx package
 *
 * @domain `gnome.org/gi-docgen`
 * @version `2026.1.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/gi-docgen`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorggidocgen
 * console.log(pkg.name)        // "gi-docgen"
 * console.log(pkg.versions[0]) // "2026.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/gi-docgen.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorggidocgenPackage = {
  /**
  * The display name of this package.
  */
  name: 'gi-docgen' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnome.org/gi-docgen' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/gi-docgen/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnome.org/gi-docgen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/gi-docgen -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/gi-docgen' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pkgx.sh>=1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@~3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2026.1.0',
    '2025.5.0',
    '2025.4.0',
    '2025.3.0',
    '2024.1.0',
  ] as const,
  aliases: [] as const,
}

export type GnomeorggidocgenPackage = typeof gnomeorggidocgenPackage
