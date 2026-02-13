/**
 * **opus-codec** - Modern audio compression for the internet.
 *
 * @domain `opus-codec.org`
 * @version `1.6.1` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install opus-codec.org`
 * @homepage https://opus-codec.org/
 * @buildDependencies `gnu.org/autoconf@2`, `gnu.org/automake@1.16`, `gnu.org/libtool@2.4`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.opuscodecorg
 * console.log(pkg.name)        // "opus-codec"
 * console.log(pkg.description) // "Modern audio compression for the internet."
 * console.log(pkg.versions[0]) // "1.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/opus-codec-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const opuscodecorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'opus-codec' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'opus-codec.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Modern audio compression for the internet.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/opus-codec.org/package.yml' as const,
  homepageUrl: 'https://opus-codec.org/' as const,
  githubUrl: 'https://github.com/xiph/opus' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install opus-codec.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +opus-codec.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install opus-codec.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf@2',
    'gnu.org/automake@1.16',
    'gnu.org/libtool@2.4',
    'gnu.org/wget',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.1',
    '1.6.0',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.0',
    '1.3.1',
  ] as const,
  aliases: [] as const,
}

export type OpuscodecorgPackage = typeof opuscodecorgPackage
