/**
 * **render** - Command-line interface for Render
 *
 * @domain `render.com`
 * @programs `render`
 * @version `0.1.11` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install render.com`
 * @homepage https://render.com/docs/cli
 * @buildDependencies `deno.land@^1.30` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rendercom
 * console.log(pkg.name)        // "render"
 * console.log(pkg.description) // "Command-line interface for Render"
 * console.log(pkg.programs)    // ["render"]
 * console.log(pkg.versions[0]) // "0.1.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/render-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rendercomPackage = {
  /**
   * The display name of this package.
   */
  name: 'render' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'render.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-line interface for Render' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/render.com/package.yml' as const,
  homepageUrl: 'https://render.com/docs/cli' as const,
  githubUrl: 'https://github.com/render-oss/cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install render.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +render.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install render.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'render',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'deno.land@^1.30',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.11',
    '0.1.10',
    '0.1.9',
    '0.1.8',
    '0.1.7',
    '0.1.5',
  ] as const,
  aliases: [] as const,
}

export type RendercomPackage = typeof rendercomPackage
