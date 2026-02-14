/**
 * **imath** - Imath is a C++ and python library of 2D and 3D vector, matrix, and math operations for computer graphics
 *
 * @domain `openexr.com/imath`
 * @version `3.2.2` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openexr.com/imath`
 * @homepage https://imath.readthedocs.io
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openexrcomimath
 * console.log(pkg.name)        // "imath"
 * console.log(pkg.description) // "Imath is a C++ and python library of 2D and 3D ..."
 * console.log(pkg.versions[0]) // "3.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openexr-com/imath.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openexrcomimathPackage = {
  /**
  * The display name of this package.
  */
  name: 'imath' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'openexr.com/imath' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Imath is a C++ and python library of 2D and 3D vector, matrix, and math operations for computer graphics' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openexr.com/imath/package.yml' as const,
  homepageUrl: 'https://imath.readthedocs.io' as const,
  githubUrl: 'https://github.com/AcademySoftwareFoundation/Imath' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install openexr.com/imath' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openexr.com/imath -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openexr.com/imath' as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.12',
    '3.1.11',
    '3.1.10',
    '3.1.9',
    '3.1.8',
    '3.1.7',
  ] as const,
  aliases: [] as const,
}

export type OpenexrcomimathPackage = typeof openexrcomimathPackage
