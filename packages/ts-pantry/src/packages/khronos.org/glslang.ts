/**
 * **glslang** - Khronos-reference front end for GLSL/ESSL, partial front end for HLSL, and a SPIR-V generator.
 *
 * @domain `khronos.org/glslang`
 * @programs `glslang`, `glslangValidator`, `spirv-remap`
 * @version `16.2.0` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install khronos.org/glslang`
 * @homepage https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/
 * @buildDependencies `cmake.org`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.khronosorgglslang
 * console.log(pkg.name)        // "glslang"
 * console.log(pkg.description) // "Khronos-reference front end for GLSL/ESSL, part..."
 * console.log(pkg.programs)    // ["glslang", "glslangValidator", ...]
 * console.log(pkg.versions[0]) // "16.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/khronos-org/glslang.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const khronosorgglslangPackage = {
  /**
   * The display name of this package.
   */
  name: 'glslang' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'khronos.org/glslang' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Khronos-reference front end for GLSL/ESSL, partial front end for HLSL, and a SPIR-V generator.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/khronos.org/glslang/package.yml' as const,
  homepageUrl: 'https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/' as const,
  githubUrl: 'https://github.com/KhronosGroup/glslang' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install khronos.org/glslang' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +khronos.org/glslang -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install khronos.org/glslang' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'glslang',
    'glslangValidator',
    'spirv-remap',
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
    '16.2.0',
    '16.1.0',
    '16.0.0',
    '15.4.0',
    '15.3.0',
    '15.2.0',
    '15.1.0',
    '15.0.0',
    '14.3.0',
    '14.2.0',
    '14.1.0',
    '14.0.0',
    '13.1.1',
    '13.1.0',
    '13.0.0',
    '12.3.1',
  ] as const,
  aliases: [] as const,
}

export type KhronosorgglslangPackage = typeof khronosorgglslangPackage
