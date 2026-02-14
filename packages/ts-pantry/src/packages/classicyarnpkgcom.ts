/**
 * **yarn** - The 1.x line is frozen - features and bugfixes now happen on https://github.com/yarnpkg/berry
 *
 * @domain `classic.yarnpkg.com`
 * @programs `yarn`, `yarnpkg`
 * @version `1.22.22` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install classic.yarnpkg.com`
 * @aliases `yarn`
 * @homepage https://yarnpkg.com/
 * @dependencies `nodejs.org>=5`
 * @buildDependencies `npmjs.com`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.yarn
 * // Or access via domain
 * const samePkg = pantry.classicyarnpkgcom
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "classic.yarnpkg"
 * console.log(pkg.description) // "The 1.x line is frozen - features and bugfixes ..."
 * console.log(pkg.programs)    // ["yarn", "yarnpkg"]
 * console.log(pkg.versions[0]) // "1.22.22" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/classic-yarnpkg-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const classicYarnPackage = {
  /**
  * The display name of this package.
  */
  name: 'classic.yarnpkg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'classic.yarnpkg.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The 1.x line is frozen - features and bugfixes now happen on https://github.com/yarnpkg/berry' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/classic.yarnpkg.com/package.yml' as const,
  homepageUrl: 'https://yarnpkg.com/' as const,
  githubUrl: 'https://github.com/yarnpkg/yarn' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install classic.yarnpkg.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +classic.yarnpkg.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install classic.yarnpkg.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'yarn',
    'yarnpkg',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org>=5',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'npmjs.com',
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.22.22',
    '1.22.21',
    '1.22.20',
    '1.22.19',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'yarn',
  ] as const,
}

export type ClassicYarnPackage = typeof classicYarnPackage
