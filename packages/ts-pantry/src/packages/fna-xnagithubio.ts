/**
 * **fna-xna.github** - FAudio - Accuracy-focused XAudio reimplementation for open platforms
 *
 * @domain `fna-xna.github.io`
 * @version `26.1.0` (25 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fna-xna.github.io`
 * @homepage https://fna-xna.github.io/
 * @dependencies `libsdl.org^2.28`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fnaxnagithubio
 * console.log(pkg.name)        // "fna-xna.github"
 * console.log(pkg.description) // "FAudio - Accuracy-focused XAudio reimplementati..."
 * console.log(pkg.versions[0]) // "26.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fna-xna-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fnaxnagithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'fna-xna.github' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fna-xna.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'FAudio - Accuracy-focused XAudio reimplementation for open platforms' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fna-xna.github.io/package.yml' as const,
  homepageUrl: 'https://fna-xna.github.io/' as const,
  githubUrl: 'https://github.com/FNA-XNA/FAudio' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fna-xna.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fna-xna.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fna-xna.github.io' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libsdl.org^2.28',
  ] as const,
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
    '26.1.0',
    '25.12.0',
    '25.11.0',
    '25.10.0',
    '25.9.0',
    '25.8.0',
    '25.7.0',
    '25.6.0',
    '25.5.0',
    '25.4.0',
    '25.3.0',
    '25.2.0',
    '25.1.0',
    '24.12.0',
    '24.11.0',
    '24.10.0',
    '24.9.0',
    '24.8.0',
    '24.7.0',
    '24.6.0',
    '24.5.0',
    '24.4.0',
    '24.3.0',
    '24.2.0',
    '24.1.0',
  ] as const,
  aliases: [] as const,
}

export type FnaxnagithubioPackage = typeof fnaxnagithubioPackage
