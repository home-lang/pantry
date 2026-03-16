/**
 * **poppler-data** - pkgx package
 *
 * @domain `poppler.freedesktop.org/poppler-data`
 * @version `0.4.12` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install poppler.freedesktop.org/poppler-data`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.popplerfreedesktoporgpopplerdata
 * console.log(pkg.name)        // "poppler-data"
 * console.log(pkg.versions[0]) // "0.4.12" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/poppler-freedesktop-org/poppler-data.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const popplerfreedesktoporgpopplerdataPackage = {
  /**
  * The display name of this package.
  */
  name: 'poppler-data' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'poppler.freedesktop.org/poppler-data' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/poppler.freedesktop.org/poppler-data/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install poppler.freedesktop.org/poppler-data' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +poppler.freedesktop.org/poppler-data -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install poppler.freedesktop.org/poppler-data' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.12',
  ] as const,
  aliases: [] as const,
}

export type PopplerfreedesktoporgpopplerdataPackage = typeof popplerfreedesktoporgpopplerdataPackage
