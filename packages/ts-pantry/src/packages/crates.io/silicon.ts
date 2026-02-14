/**
 * **silicon** - Create beautiful image of your source code.
 *
 * @domain `crates.io/silicon`
 * @programs `silicon`
 * @version `0.5.3` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/silicon`
 * @dependencies `harfbuzz.org^5`, `linux:freedesktop.org/fontconfig`, `linux:freetype.org`, ... (+1 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiosilicon
 * console.log(pkg.name)        // "silicon"
 * console.log(pkg.description) // "Create beautiful image of your source code."
 * console.log(pkg.programs)    // ["silicon"]
 * console.log(pkg.versions[0]) // "0.5.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/silicon.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiosiliconPackage = {
  /**
  * The display name of this package.
  */
  name: 'silicon' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/silicon' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Create beautiful image of your source code.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/silicon/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Aloxaf/silicon' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/silicon' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/silicon -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/silicon' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'silicon',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'harfbuzz.org^5',
    'linux:freedesktop.org/fontconfig',
    'linux:freetype.org',
    'linux:x.org/xcb',
  ] as const,
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
    '0.5.3',
    '0.5.2',
    '0.5.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiosiliconPackage = typeof cratesiosiliconPackage
