/**
 * **checkmake** - experimental linter/analyzer for Makefiles
 *
 * @domain `github.com/mrtazz/checkmake`
 * @programs `checkmake`
 * @version `0.3.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mrtazz/checkmake`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommrtazzcheckmake
 * console.log(pkg.name)        // "checkmake"
 * console.log(pkg.description) // "experimental linter/analyzer for Makefiles"
 * console.log(pkg.programs)    // ["checkmake"]
 * console.log(pkg.versions[0]) // "0.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mrtazz/checkmake.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const checkmakePackage = {
  /**
   * The display name of this package.
   */
  name: 'checkmake' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mrtazz/checkmake' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'experimental linter/analyzer for Makefiles' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mrtazz/checkmake/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mrtazz/checkmake' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mrtazz/checkmake' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mrtazz/checkmake -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mrtazz/checkmake' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'checkmake',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.2',
  ] as const,
  aliases: [] as const,
}

export type CheckmakePackage = typeof checkmakePackage
