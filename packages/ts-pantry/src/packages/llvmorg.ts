/**
 * **llvm** - The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.
 *
 * @domain `llvm.org`
 * @programs `lld`, `clang`, `clang++`, `cc`, `c++`, ... (+9 more)
 * @version `21.1.8` (53 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install llvm.org`
 * @homepage http://llvm.org
 * @dependencies `zlib.net@1`, `facebook.com/zstd`
 * @buildDependencies `cmake.org@>=3<3.29`, `python.org@>=3<3.12`, `crates.io/semverator` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.llvmorg
 * console.log(pkg.name)        // "llvm"
 * console.log(pkg.description) // "The LLVM Project is a collection of modular and..."
 * console.log(pkg.programs)    // ["lld", "clang", ...]
 * console.log(pkg.versions[0]) // "21.1.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/llvm-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const llvmorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'llvm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'llvm.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/llvm.org/package.yml' as const,
  homepageUrl: 'http://llvm.org' as const,
  githubUrl: 'https://github.com/llvm/llvm-project' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install llvm.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +llvm.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install llvm.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'lld',
    'clang',
    'clang++',
    'cc',
    'c++',
    'cpp',
    'nm',
    'objcopy',
    'ranlib',
    'readelf',
    'strings',
    'strip',
    'llvm-profdata',
    'llvm-cov',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net@1',
    'facebook.com/zstd',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@>=3<3.29',
    'python.org@>=3<3.12',
    'crates.io/semverator',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '21.1.8',
    '21.1.7',
    '21.1.6',
    '21.1.5',
    '21.1.4',
    '21.1.3',
    '21.1.2',
    '21.1.1',
    '21.1.0',
    '20.1.8',
    '20.1.7',
    '20.1.6',
    '20.1.5',
    '20.1.4',
    '20.1.3',
    '20.1.2',
    '20.1.1',
    '20.1.0',
    '19.1.7',
    '19.1.6',
    '19.1.4',
    '19.1.3',
    '19.1.2',
    '19.1.1',
    '19.1.0',
    '18.1.8',
    '18.1.7',
    '18.1.6',
    '18.1.5',
    '18.1.4',
    '18.1.3',
    '18.1.2',
    '18.1.1',
    '18.1.0',
    '17.0.6',
    '17.0.5',
    '17.0.4',
    '17.0.3',
    '17.0.2',
    '17.0.1',
    '17.0.0',
    '16.0.6',
    '16.0.5',
    '16.0.4',
    '16.0.3',
    '16.0.2',
    '16.0.1',
    '15.0.7',
    '15.0.6',
    '14.0.6',
    '14.0.3',
    '13.0.1',
    '12.0.1',
  ] as const,
  aliases: [] as const,
}

export type LlvmorgPackage = typeof llvmorgPackage
