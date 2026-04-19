/**
 * **ccache** - Object-file caching compiler wrapper
 *
 * @domain `ccache.dev`
 * @programs `ccache`
 * @version `4.13.2` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ccache.dev`
 * @homepage https://ccache.dev/
 * @dependencies `github.com/redis/hiredis`, `facebook.com/zstd`
 * @buildDependencies `asciidoctor.org`, `cmake.org`, `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.ccachedev
 * console.log(pkg.name)        // "ccache"
 * console.log(pkg.description) // "Object-file caching compiler wrapper"
 * console.log(pkg.programs)    // ["ccache"]
 * console.log(pkg.versions[0]) // "4.13.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/ccache-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const ccachedevPackage = {
  /**
  * The display name of this package.
  */
  name: 'ccache' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ccache.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Object-file caching compiler wrapper' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ccache.dev/package.yml' as const,
  homepageUrl: 'https://ccache.dev/' as const,
  githubUrl: 'https://github.com/ccache/ccache' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install ccache.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ccache.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install ccache.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ccache',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'github.com/redis/hiredis',
    'facebook.com/zstd',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'asciidoctor.org',
    'cmake.org',
    'linux:llvm.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '4.13.4',
    '4.13.3',
    '4.13.2',
    '4.13.1',
    '4.13',
    '4.13.0',
    '4.12.3',
    '4.12.2',
    '4.12.1',
    '4.12',
    '4.12.0',
    '4.11.3',
    '4.11.2',
    '4.11.1',
    '4.11',
    '4.11.0',
    '4.10.2',
    '4.10.1',
    '4.10',
    '4.10.0',
    '4.9.1',
    '4.9',
    '4.8.3',
    '4.8.2',
    '4.8.1',
    '4.8',
    '4.7.5',
    '4.7.4',
    '4.7.3',
    '4.7.2',
    '4.7.1',
    '4.7',
    '4.6.3',
    '4.6.2',
    '4.6.1',
    '4.6',
    '4.5.1',
    '4.5',
    '4.4.2',
    '4.4.1',
    '4.4',
    '4.3',
    '4.2.1',
    '4.2',
    '4.1',
    '4.0',
    '3.7.12',
    '3.7.11',
    '3.7.10',
    '3.7.9',
    '3.7.8',
    '3.7.7',
    '3.7.6',
    '3.7.5',
    '3.7.4',
    '3.7.3',
  ] as const,
  aliases: [] as const,
}

export type CcachedevPackage = typeof ccachedevPackage
