/**
 * **pixi** - Package management made easy
 *
 * @domain `prefix.dev`
 * @programs `pixi`
 * @version `0.63.2` (106 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install prefix.dev`
 * @homepage https://pixi.sh
 * @dependencies `openssl.org^1.1`, `libgit2.org~1.7 # links to libgit2.so.1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.prefixdev
 * console.log(pkg.name)        // "pixi"
 * console.log(pkg.description) // "Package management made easy"
 * console.log(pkg.programs)    // ["pixi"]
 * console.log(pkg.versions[0]) // "0.63.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/prefix-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const prefixdevPackage = {
  /**
   * The display name of this package.
   */
  name: 'pixi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'prefix.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Package management made easy' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/prefix.dev/package.yml' as const,
  homepageUrl: 'https://pixi.sh' as const,
  githubUrl: 'https://github.com/prefix-dev/pixi' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install prefix.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +prefix.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install prefix.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pixi',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.63.2',
    '0.63.1',
    '0.63.0',
    '0.62.2',
    '0.62.1',
    '0.62.0',
    '0.61.0',
    '0.60.0',
    '0.59.0',
    '0.58.0',
    '0.57.0',
    '0.56.0',
    '0.55.0',
    '0.54.2',
    '0.54.1',
    '0.54.0',
    '0.53.0',
    '0.52.0',
    '0.51.0',
    '0.50.2',
    '0.50.1',
    '0.50.0',
    '0.49.0',
    '0.48.2',
    '0.48.1',
    '0.48.0',
    '0.47.0',
    '0.46.0',
    '0.45.0',
    '0.44.0',
    '0.43.3',
    '0.43.2',
    '0.43.1',
    '0.43.0',
    '0.42.1',
    '0.42.0',
    '0.41.4',
    '0.41.3',
    '0.41.2',
    '0.41.1',
    '0.41.0',
    '0.40.3',
    '0.40.2',
    '0.40.1',
    '0.40.0',
    '0.39.5',
    '0.39.4',
    '0.39.3',
    '0.39.2',
    '0.39.1',
    '0.39.0',
    '0.38.0',
    '0.37.0',
    '0.36.0',
    '0.35.0',
    '0.34.0',
    '0.33.0',
    '0.32.2',
    '0.32.1',
    '0.32.0',
    '0.31.0',
    '0.30.0',
    '0.29.0',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.1',
    '0.27.0',
    '0.26.1',
    '0.26.0',
    '0.25.0',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.0',
    '0.22.0',
    '0.21.1',
    '0.21.0',
    '0.20.1',
    '0.20.0',
    '0.19.1',
    '0.19.0',
    '0.18.0',
    '0.17.1',
    '0.17.0',
    '0.16.1',
    '0.16.0',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.0',
    '0.13.0',
    '0.12.0',
    '0.11.1',
    '0.11.0',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.0',
    '0.7.0',
    '0.6.0',
    '0.5.0',
    '0.4.0',
    '0.3.0',
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type PrefixdevPackage = typeof prefixdevPackage
