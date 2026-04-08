/**
 * **pixi** - Package management made easy
 *
 * @domain `prefix.dev`
 * @programs `pixi`
 * @version `0.66.0` (109 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install prefix.dev`
 * @homepage https://pixi.sh
 * @dependencies `openssl.org^1.1`, `libgit2.org~1.7 # links to libgit2.so.1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.prefixdev
 * console.log(pkg.name)        // "pixi"
 * console.log(pkg.description) // "Package management made easy"
 * console.log(pkg.programs)    // ["pixi"]
 * console.log(pkg.versions[0]) // "0.66.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/prefix-dev.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install prefix.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +prefix.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install prefix.dev' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.67.0',
    '0.66.0',
    '0.65.0',
    '0.64.0',
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
  ] as const,
  aliases: [] as const,
}

export type PrefixdevPackage = typeof prefixdevPackage
