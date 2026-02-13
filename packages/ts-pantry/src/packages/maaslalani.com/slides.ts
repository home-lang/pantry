/**
 * **slides** - Terminal based presentation tool
 *
 * @domain `maaslalani.com/slides`
 * @programs `slides`
 * @version `0.9.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install maaslalani.com/slides`
 * @homepage http://maaslalani.com/slides/
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.maaslalanicomslides
 * console.log(pkg.name)        // "slides"
 * console.log(pkg.description) // "Terminal based presentation tool"
 * console.log(pkg.programs)    // ["slides"]
 * console.log(pkg.versions[0]) // "0.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/maaslalani-com/slides.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const maaslalanicomslidesPackage = {
  /**
   * The display name of this package.
   */
  name: 'slides' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'maaslalani.com/slides' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Terminal based presentation tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/maaslalani.com/slides/package.yml' as const,
  homepageUrl: 'http://maaslalani.com/slides/' as const,
  githubUrl: 'https://github.com/maaslalani/slides' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install maaslalani.com/slides' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +maaslalani.com/slides -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install maaslalani.com/slides' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'slides',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
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
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type MaaslalanicomslidesPackage = typeof maaslalanicomslidesPackage
