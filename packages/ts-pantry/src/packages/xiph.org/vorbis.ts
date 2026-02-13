/**
 * **vorbis** - Reference implementation of the Ogg Vorbis audio format.
 *
 * @domain `xiph.org/vorbis`
 * @version `1.3.7` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xiph.org/vorbis`
 * @dependencies `xiph.org/ogg^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xiphorgvorbis
 * console.log(pkg.name)        // "vorbis"
 * console.log(pkg.description) // "Reference implementation of the Ogg Vorbis audi..."
 * console.log(pkg.versions[0]) // "1.3.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xiph-org/vorbis.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xiphorgvorbisPackage = {
  /**
   * The display name of this package.
   */
  name: 'vorbis' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'xiph.org/vorbis' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Reference implementation of the Ogg Vorbis audio format.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/vorbis/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/xiph/vorbis' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install xiph.org/vorbis' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xiph.org/vorbis -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xiph.org/vorbis' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'xiph.org/ogg^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.7',
  ] as const,
  aliases: [] as const,
}

export type XiphorgvorbisPackage = typeof xiphorgvorbisPackage
