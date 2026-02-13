/**
 * **SvtAv1EncApp** - AV1 encoder
 *
 * @domain `gitlab.com/AOMediaCodec/SVT-AV1`
 * @programs `SvtAv1EncApp`
 * @version `3.1.2` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gitlab.com/AOMediaCodec/SVT-AV1`
 * @homepage https://gitlab.com/AOMediaCodec/SVT-AV1
 * @buildDependencies `cmake.org`, `yasm.tortall.net` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitlabcomaomediacodecsvtav1
 * console.log(pkg.name)        // "SvtAv1EncApp"
 * console.log(pkg.description) // "AV1 encoder"
 * console.log(pkg.programs)    // ["SvtAv1EncApp"]
 * console.log(pkg.versions[0]) // "3.1.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gitlab-com/AOMediaCodec/SVT-AV1.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitlabcomaomediacodecsvtav1Package = {
  /**
   * The display name of this package.
   */
  name: 'SvtAv1EncApp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gitlab.com/AOMediaCodec/SVT-AV1' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'AV1 encoder' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gitlab.com/AOMediaCodec/SVT-AV1/package.yml' as const,
  homepageUrl: 'https://gitlab.com/AOMediaCodec/SVT-AV1' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gitlab.com/AOMediaCodec/SVT-AV1' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gitlab.com/AOMediaCodec/SVT-AV1 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gitlab.com/AOMediaCodec/SVT-AV1' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'SvtAv1EncApp',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
    'yasm.tortall.net',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.0',
    '1.8.0',
    '1.7.0',
    '1.6.0',
  ] as const,
  aliases: [] as const,
}

export type Gitlabcomaomediacodecsvtav1Package = typeof gitlabcomaomediacodecsvtav1Package
