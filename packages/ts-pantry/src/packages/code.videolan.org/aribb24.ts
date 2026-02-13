/**
 * **aribb24** - pkgx package
 *
 * @domain `code.videolan.org/aribb24`
 * @version `1.0.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install code.videolan.org/aribb24`
 * @dependencies `libpng.org`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.codevideolanorgaribb24
 * console.log(pkg.name)        // "aribb24"
 * console.log(pkg.versions[0]) // "1.0.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/code-videolan-org/aribb24.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const codevideolanorgaribb24Package = {
  /**
   * The display name of this package.
   */
  name: 'aribb24' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'code.videolan.org/aribb24' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/code.videolan.org/aribb24/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install code.videolan.org/aribb24' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +code.videolan.org/aribb24 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install code.videolan.org/aribb24' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libpng.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.4',
  ] as const,
  aliases: [] as const,
}

export type Codevideolanorgaribb24Package = typeof codevideolanorgaribb24Package
