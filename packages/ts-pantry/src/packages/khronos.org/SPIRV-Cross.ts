/**
 * **spirv-cross** - SPIRV-Cross is a practical tool and library for performing reflection on SPIR-V and disassembling SPIR-V back to high level languages.
 *
 * @domain `khronos.org/SPIRV-Cross`
 * @programs `spirv-cross`
 * @version `2021.1.15` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install khronos.org/SPIRV-Cross`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.khronosorgspirvcross
 * console.log(pkg.name)        // "spirv-cross"
 * console.log(pkg.description) // "SPIRV-Cross is a practical tool and library for..."
 * console.log(pkg.programs)    // ["spirv-cross"]
 * console.log(pkg.versions[0]) // "2021.1.15" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/khronos-org/SPIRV-Cross.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const khronosorgspirvcrossPackage = {
  /**
  * The display name of this package.
  */
  name: 'spirv-cross' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'khronos.org/SPIRV-Cross' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'SPIRV-Cross is a practical tool and library for performing reflection on SPIR-V and disassembling SPIR-V back to high level languages.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/khronos.org/SPIRV-Cross/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/KhronosGroup/SPIRV-Cross' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install khronos.org/SPIRV-Cross' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +khronos.org/SPIRV-Cross -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install khronos.org/SPIRV-Cross' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'spirv-cross',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2021.1.15',
  ] as const,
  aliases: [] as const,
}

export type KhronosorgspirvcrossPackage = typeof khronosorgspirvcrossPackage
