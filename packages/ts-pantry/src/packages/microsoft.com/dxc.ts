/**
 * **dxc** - This repo hosts the source for the DirectX Shader Compiler which is based on LLVM/Clang.
 *
 * @domain `microsoft.com/dxc`
 * @programs `dxc`, `dxv`, `dxa`, `dxr`, `dxl`
 * @version `1.8.2505.1` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install microsoft.com/dxc`
 * @dependencies `zlib.net^1`
 * @buildDependencies `cmake.org`, `python.org@>=3.7<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.microsoftcomdxc
 * console.log(pkg.name)        // "dxc"
 * console.log(pkg.description) // "This repo hosts the source for the DirectX Shad..."
 * console.log(pkg.programs)    // ["dxc", "dxv", ...]
 * console.log(pkg.versions[0]) // "1.8.2505.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/microsoft-com/dxc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const microsoftcomdxcPackage = {
  /**
   * The display name of this package.
   */
  name: 'dxc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'microsoft.com/dxc' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'This repo hosts the source for the DirectX Shader Compiler which is based on LLVM/Clang.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/dxc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/microsoft/DirectXShaderCompiler' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install microsoft.com/dxc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +microsoft.com/dxc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install microsoft.com/dxc' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dxc',
    'dxv',
    'dxa',
    'dxr',
    'dxl',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
    'python.org@>=3.7<3.12',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.8.2505.1',
    '1.8.2505',
    '1.8.2502',
    '1.8.2407',
    '1.8.2405',
    '1.8.2403.2',
    '1.8.2403.1',
    '1.8.2403',
    '1.7.2308',
  ] as const,
  aliases: [] as const,
}

export type MicrosoftcomdxcPackage = typeof microsoftcomdxcPackage
