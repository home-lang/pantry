/**
 * **speexdsp** - Speex audio processing library - THIS IS A MIRROR, DEVELOPMENT HAPPENS AT https://gitlab.xiph.org/xiph/speexdsp
 *
 * @domain `github.com/xiph/speexdsp`
 * @version `1.2.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/xiph/speexdsp`
 * @homepage https://speex.org
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomxiphspeexdsp
 * console.log(pkg.name)        // "speexdsp"
 * console.log(pkg.description) // "Speex audio processing library - THIS IS A MIRR..."
 * console.log(pkg.versions[0]) // "1.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/xiph/speexdsp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const speexdspPackage = {
  /**
   * The display name of this package.
   */
  name: 'speexdsp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/xiph/speexdsp' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Speex audio processing library - THIS IS A MIRROR, DEVELOPMENT HAPPENS AT https://gitlab.xiph.org/xiph/speexdsp' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/xiph/speexdsp/package.yml' as const,
  homepageUrl: 'https://speex.org' as const,
  githubUrl: 'https://github.com/xiph/speexdsp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/xiph/speexdsp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/xiph/speexdsp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/xiph/speexdsp' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
    'linux:gnu.org/gcc',
    'linux:gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.1',
  ] as const,
  aliases: [] as const,
}

export type SpeexdspPackage = typeof speexdspPackage
