/**
 * **vhs** - Your CLI home video recorder 📼
 *
 * @domain `charm.sh/vhs`
 * @programs `vhs`
 * @version `0.10.0` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install charm.sh/vhs`
 * @dependencies `ffmpeg.org>=5`, `tsl0922.github.io/ttyd^1.7.2`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.charmshvhs
 * console.log(pkg.name)        // "vhs"
 * console.log(pkg.description) // "Your CLI home video recorder 📼"
 * console.log(pkg.programs)    // ["vhs"]
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/charm-sh/vhs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const charmshvhsPackage = {
  /**
   * The display name of this package.
   */
  name: 'vhs' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'charm.sh/vhs' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Your CLI home video recorder 📼' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/vhs/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/charmbracelet/vhs' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install charm.sh/vhs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +charm.sh/vhs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install charm.sh/vhs' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'vhs',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'ffmpeg.org>=5',
    'tsl0922.github.io/ttyd^1.7.2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.10.0',
    '0.9.0',
    '0.8.0',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.0',
    '0.5.0',
    '0.4.0',
    '0.3.0',
    '0.2.0',
    '0.1.1',
    '0.1.0',
    '0.0.1',
  ] as const,
  aliases: [] as const,
}

export type CharmshvhsPackage = typeof charmshvhsPackage
