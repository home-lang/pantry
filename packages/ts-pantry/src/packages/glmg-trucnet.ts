/**
 * **glm.g-truc** - OpenGL Mathematics (GLM)
 *
 * @domain `glm.g-truc.net`
 * @version `1.0.3` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install glm.g-truc.net`
 * @homepage https://glm.g-truc.net
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.glmgtrucnet
 * console.log(pkg.name)        // "glm.g-truc"
 * console.log(pkg.description) // "OpenGL Mathematics (GLM)"
 * console.log(pkg.versions[0]) // "1.0.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/glm-g-truc-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const glmgtrucnetPackage = {
  /**
   * The display name of this package.
   */
  name: 'glm.g-truc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'glm.g-truc.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'OpenGL Mathematics (GLM)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/glm.g-truc.net/package.yml' as const,
  homepageUrl: 'https://glm.g-truc.net' as const,
  githubUrl: 'https://github.com/g-truc/glm' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install glm.g-truc.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +glm.g-truc.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install glm.g-truc.net' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.9.9.8',
  ] as const,
  aliases: [] as const,
}

export type GlmgtrucnetPackage = typeof glmgtrucnetPackage
