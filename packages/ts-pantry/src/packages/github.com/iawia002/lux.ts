/**
 * **lux** - 👾 Fast and simple video download library and CLI tool written in Go
 *
 * @domain `github.com/iawia002/lux`
 * @programs `lux`
 * @version `0.24.1` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/iawia002/lux`
 * @dependencies `ffmpeg.org`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomiawia002lux
 * console.log(pkg.name)        // "lux"
 * console.log(pkg.description) // "👾 Fast and simple video download library and C..."
 * console.log(pkg.programs)    // ["lux"]
 * console.log(pkg.versions[0]) // "0.24.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/iawia002/lux.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const luxPackage = {
  /**
  * The display name of this package.
  */
  name: 'lux' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/iawia002/lux' as const,
  /**
  * Brief description of what this package does.
  */
  description: '👾 Fast and simple video download library and CLI tool written in Go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/iawia002/lux/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/iawia002/lux' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/iawia002/lux' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/iawia002/lux -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/iawia002/lux' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'lux',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'ffmpeg.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.24.1',
    '0.24.0',
    '0.23.0',
    '0.22.0',
    '0.21.0',
    '0.20.0',
    '0.19.0',
  ] as const,
  aliases: [] as const,
}

export type LuxPackage = typeof luxPackage
