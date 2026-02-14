/**
 * **libgeotiff** - Official repository of the libgeotiff project
 *
 * @domain `github.com/OSGeo/libgeotiff`
 * @programs `applygeo`, `geotifcp`, `listgeo`
 * @version `1.7.4` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/OSGeo/libgeotiff`
 * @dependencies `libjpeg-turbo.org`, `simplesystems.org/libtiff`, `proj.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomosgeolibgeotiff
 * console.log(pkg.name)        // "libgeotiff"
 * console.log(pkg.description) // "Official repository of the libgeotiff project"
 * console.log(pkg.programs)    // ["applygeo", "geotifcp", ...]
 * console.log(pkg.versions[0]) // "1.7.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/OSGeo/libgeotiff.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libgeotiffPackage = {
  /**
  * The display name of this package.
  */
  name: 'libgeotiff' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/OSGeo/libgeotiff' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Official repository of the libgeotiff project' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/OSGeo/libgeotiff/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/OSGeo/libgeotiff' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/OSGeo/libgeotiff' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/OSGeo/libgeotiff -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/OSGeo/libgeotiff' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'applygeo',
    'geotifcp',
    'listgeo',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libjpeg-turbo.org',
    'simplesystems.org/libtiff',
    'proj.org',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.7.4',
    '1.7.3',
    '1.7.2',
    '1.7.1',
  ] as const,
  aliases: [] as const,
}

export type LibgeotiffPackage = typeof libgeotiffPackage
