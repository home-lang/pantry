/**
 * **mutagen** - Python module for handling audio metadata
 *
 * @domain `github.com/quodlibet/mutagen`
 * @version `1.47.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/quodlibet/mutagen`
 * @homepage https://mutagen.readthedocs.io
 * @dependencies `python.org>=3.11`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomquodlibetmutagen
 * console.log(pkg.name)        // "mutagen"
 * console.log(pkg.description) // "Python module for handling audio metadata"
 * console.log(pkg.versions[0]) // "1.47.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/quodlibet/mutagen.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mutagenPackage = {
  /**
   * The display name of this package.
   */
  name: 'mutagen' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/quodlibet/mutagen' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Python module for handling audio metadata' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/quodlibet/mutagen/package.yml' as const,
  homepageUrl: 'https://mutagen.readthedocs.io' as const,
  githubUrl: 'https://github.com/quodlibet/mutagen' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/quodlibet/mutagen' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/quodlibet/mutagen -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/quodlibet/mutagen' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.11',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.47.0',
  ] as const,
  aliases: [] as const,
}

export type MutagenPackage = typeof mutagenPackage
