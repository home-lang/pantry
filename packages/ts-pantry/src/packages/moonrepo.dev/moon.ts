/**
 * **moon** - A build system and monorepo management tool for the web ecosystem, written in Rust.
 *
 * @domain `moonrepo.dev/moon`
 * @programs `moon`
 * @version `1.41.8` (81 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install moonrepo.dev/moon`
 * @homepage https://moonrepo.dev/moon
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.moonrepodevmoon
 * console.log(pkg.name)        // "moon"
 * console.log(pkg.description) // "A build system and monorepo management tool for..."
 * console.log(pkg.programs)    // ["moon"]
 * console.log(pkg.versions[0]) // "1.41.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/moonrepo-dev/moon.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const moonrepodevmoonPackage = {
  /**
   * The display name of this package.
   */
  name: 'moon' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'moonrepo.dev/moon' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A build system and monorepo management tool for the web ecosystem, written in Rust.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/moonrepo.dev/moon/package.yml' as const,
  homepageUrl: 'https://moonrepo.dev/moon' as const,
  githubUrl: 'https://github.com/moonrepo/moon' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install moonrepo.dev/moon' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +moonrepo.dev/moon -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install moonrepo.dev/moon' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'moon',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.41.8',
    '1.41.7',
    '1.41.6',
    '1.41.5',
    '1.41.4',
    '1.41.3',
    '1.41.2',
    '1.41.1',
    '1.41.0',
    '1.40.5',
    '1.40.4',
    '1.40.3',
    '1.40.2',
    '1.40.1',
    '1.40.0',
    '1.39.4',
    '1.39.3',
    '1.39.2',
    '1.39.1',
    '1.39.0',
    '1.38.6',
    '1.38.5',
    '1.38.4',
    '1.38.3',
    '1.38.2',
    '1.38.1',
    '1.38.0',
    '1.37.3',
    '1.37.2',
    '1.37.1',
    '1.37.0',
    '1.36.3',
    '1.36.2',
    '1.36.1',
    '1.36.0',
    '1.35.7',
    '1.35.6',
    '1.35.5',
    '1.35.4',
    '1.35.3',
    '1.35.2',
    '1.35.1',
    '1.35.0',
    '1.34.3',
    '1.34.2',
    '1.34.1',
    '1.34.0',
    '1.33.3',
    '1.33.2',
    '1.33.1',
    '1.33.0',
    '1.32.9',
    '1.32.8',
    '1.32.7',
    '1.32.6',
    '1.32.5',
    '1.32.4',
    '1.32.3',
    '1.32.2',
    '1.32.1',
    '1.32.0',
    '1.31.3',
    '1.31.2',
    '1.31.1',
    '1.31.0',
    '1.30.6',
    '1.30.5',
    '1.30.4',
    '1.30.3',
    '1.30.2',
    '1.30.1',
    '1.30.0',
    '1.29.4',
    '1.29.3',
    '1.29.2',
    '1.29.1',
    '1.29.0',
    '1.28.3',
    '1.28.2',
    '1.28.1',
    '1.25.4',
  ] as const,
  aliases: [] as const,
}

export type MoonrepodevmoonPackage = typeof moonrepodevmoonPackage
