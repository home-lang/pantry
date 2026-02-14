/**
 * **libexif.github** - A library for parsing, editing, and saving EXIF data
 *
 * @domain `libexif.github.io`
 * @version `0.6.25` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libexif.github.io`
 * @dependencies `gnu.org/gettext`
 * @buildDependencies `gnu.org/wget` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libexifgithubio
 * console.log(pkg.name)        // "libexif.github"
 * console.log(pkg.description) // "A library for parsing, editing, and saving EXIF..."
 * console.log(pkg.versions[0]) // "0.6.25" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libexif-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libexifgithubioPackage = {
  /**
  * The display name of this package.
  */
  name: 'libexif.github' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libexif.github.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A library for parsing, editing, and saving EXIF data' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libexif.github.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/libexif/libexif' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libexif.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libexif.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libexif.github.io' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/gettext',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/wget',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.25',
    '0.6.24',
  ] as const,
  aliases: [] as const,
}

export type LibexifgithubioPackage = typeof libexifgithubioPackage
