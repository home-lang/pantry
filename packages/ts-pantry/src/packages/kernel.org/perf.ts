/**
 * **perf** - Native Linux performance counters, sampling and ELF/DWARF reports.
 *
 * @domain `kernel.org/perf`
 * @programs `perf`
 * @version `7.2.11` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install kernel.org/perf`
 * @homepage https://perf.wiki.kernel.org/
 * @dependencies `elfutils.org`, `zlib.net^1`, `tukaani.org/xz^5`, ... (+2 more)
 * @buildDependencies `freedesktop.org/pkg-config`, `gnu.org/bison`, `github.com/westes/flex`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.kernelorgperf
 * console.log(pkg.name)        // "perf"
 * console.log(pkg.description) // "Native Linux performance counters, sampling and..."
 * console.log(pkg.programs)    // ["perf"]
 * console.log(pkg.versions[0]) // "7.2.11" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/kernel-org/perf.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const perfPackage = {
  /**
  * The display name of this package.
  */
  name: 'perf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kernel.org/perf' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Native Linux performance counters, sampling and ELF/DWARF reports.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://perf.wiki.kernel.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install kernel.org/perf' as const,
  pantryInstallCommand: 'pantry install kernel.org/perf' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'perf',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'elfutils.org',
    'zlib.net^1',
    'tukaani.org/xz^5',
    'facebook.com/zstd^1',
    'gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'freedesktop.org/pkg-config',
    'gnu.org/bison',
    'github.com/westes/flex',
    'python.org^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '7.2.11',
  ] as const,
  aliases: [] as const,
}

export type PerfPackage = typeof perfPackage
