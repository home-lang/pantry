/**
 * **spirv** - API and commands for processing SPIR-V modules
 *
 * @domain `khronos.org/SPIRV-Tools`
 * @programs `spirv-as`, `spirv-cfg`, `spirv-dis`, `spirv-lesspipe.sh`, `spirv-link`, ... (+5 more)
 * @version `2026.1.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install khronos.org/SPIRV-Tools`
 * @buildDependencies `cmake.org`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.khronosorgspirvtools
 * console.log(pkg.name)        // "spirv"
 * console.log(pkg.description) // "API and commands for processing SPIR-V modules"
 * console.log(pkg.programs)    // ["spirv-as", "spirv-cfg", ...]
 * console.log(pkg.versions[0]) // "2026.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/khronos-org/SPIRV-Tools.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const khronosorgspirvtoolsPackage = {
  /**
  * The display name of this package.
  */
  name: 'spirv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'khronos.org/SPIRV-Tools' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'API and commands for processing SPIR-V modules' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/khronos.org/SPIRV-Tools/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/KhronosGroup/SPIRV-Tools' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install khronos.org/SPIRV-Tools' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +khronos.org/SPIRV-Tools -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install khronos.org/SPIRV-Tools' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'spirv-as',
    'spirv-cfg',
    'spirv-dis',
    'spirv-lesspipe.sh',
    'spirv-link',
    'spirv-lint',
    'spirv-objdump',
    'spirv-opt',
    'spirv-reduce',
    'spirv-val',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
    'python.org@~3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2026.1.0',
    '2025.5.0',
    '2025.4.0',
    '2025.1.0',
    '2024.3.0',
    '2024.2.0',
    '2024.1.0',
  ] as const,
  aliases: [] as const,
}

export type KhronosorgspirvtoolsPackage = typeof khronosorgspirvtoolsPackage
