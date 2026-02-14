/**
 * **libjpeg-turbo** - Main libjpeg-turbo repository
 *
 * @domain `libjpeg-turbo.org`
 * @programs `cjpeg`, `djpeg`, `jpegtran`, `rdjpgcom`, `tjbench`, ... (+1 more)
 * @version `3.1.3` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libjpeg-turbo.org`
 * @homepage https://libjpeg-turbo.org
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libjpegturboorg
 * console.log(pkg.name)        // "libjpeg-turbo"
 * console.log(pkg.description) // "Main libjpeg-turbo repository"
 * console.log(pkg.programs)    // ["cjpeg", "djpeg", ...]
 * console.log(pkg.versions[0]) // "3.1.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libjpeg-turbo-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libjpegturboorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'libjpeg-turbo' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libjpeg-turbo.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Main libjpeg-turbo repository' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libjpeg-turbo.org/package.yml' as const,
  homepageUrl: 'https://libjpeg-turbo.org' as const,
  githubUrl: 'https://github.com/libjpeg-turbo/libjpeg-turbo' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libjpeg-turbo.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libjpeg-turbo.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libjpeg-turbo.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cjpeg',
    'djpeg',
    'jpegtran',
    'rdjpgcom',
    'tjbench',
    'wrjpgcom',
  ] as const,
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
    '3.1.3',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.1.5.1',
  ] as const,
  aliases: [] as const,
}

export type LibjpegturboorgPackage = typeof libjpegturboorgPackage
