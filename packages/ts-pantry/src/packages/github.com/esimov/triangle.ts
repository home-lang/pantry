/**
 * **triangle** - Convert images to computer generated art using delaunay triangulation.
 *
 * @domain `github.com/esimov/triangle`
 * @programs `triangle`
 * @version `2.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/esimov/triangle`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomesimovtriangle
 * console.log(pkg.name)        // "triangle"
 * console.log(pkg.description) // "Convert images to computer generated art using ..."
 * console.log(pkg.programs)    // ["triangle"]
 * console.log(pkg.versions[0]) // "2.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/esimov/triangle.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const trianglePackage = {
  /**
  * The display name of this package.
  */
  name: 'triangle' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/esimov/triangle' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Convert images to computer generated art using delaunay triangulation.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/esimov/triangle/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/esimov/triangle' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/esimov/triangle' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/esimov/triangle -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/esimov/triangle' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'triangle',
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
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type TrianglePackage = typeof trianglePackage
