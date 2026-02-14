/**
 * **libpipeline** - pkgx package
 *
 * @domain `libpipeline.gitlab.io/libpipeline`
 * @version `1.5.8` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libpipeline.gitlab.io/libpipeline`
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libpipelinegitlabiolibpipeline
 * console.log(pkg.name)        // "libpipeline"
 * console.log(pkg.versions[0]) // "1.5.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libpipeline-gitlab-io/libpipeline.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libpipelinegitlabiolibpipelinePackage = {
  /**
  * The display name of this package.
  */
  name: 'libpipeline' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libpipeline.gitlab.io/libpipeline' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libpipeline.gitlab.io/libpipeline/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libpipeline.gitlab.io/libpipeline' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libpipeline.gitlab.io/libpipeline -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libpipeline.gitlab.io/libpipeline' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.5.8',
    '1.5.7',
  ] as const,
  aliases: [] as const,
}

export type LibpipelinegitlabiolibpipelinePackage = typeof libpipelinegitlabiolibpipelinePackage
