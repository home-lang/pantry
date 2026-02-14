/**
 * **libdeflate** - Heavily optimized library for DEFLATE/zlib/gzip compression and decompression
 *
 * @domain `github.com/ebiggers/libdeflate`
 * @programs `libdeflate-gzip`, `libdeflate-gunzip`
 * @version `1.25.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/ebiggers/libdeflate`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomebiggerslibdeflate
 * console.log(pkg.name)        // "libdeflate"
 * console.log(pkg.description) // "Heavily optimized library for DEFLATE/zlib/gzip..."
 * console.log(pkg.programs)    // ["libdeflate-gzip", "libdeflate-gunzip"]
 * console.log(pkg.versions[0]) // "1.25.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/ebiggers/libdeflate.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libdeflatePackage = {
  /**
  * The display name of this package.
  */
  name: 'libdeflate' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/ebiggers/libdeflate' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Heavily optimized library for DEFLATE/zlib/gzip compression and decompression' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ebiggers/libdeflate/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ebiggers/libdeflate' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/ebiggers/libdeflate' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ebiggers/libdeflate -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/ebiggers/libdeflate' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'libdeflate-gzip',
    'libdeflate-gunzip',
  ] as const,
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
    '1.25.0',
    '1.24.0',
    '1.23.0',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.0',
  ] as const,
  aliases: [] as const,
}

export type LibdeflatePackage = typeof libdeflatePackage
