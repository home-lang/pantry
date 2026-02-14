/**
 * **glslc** - A collection of tools, libraries, and tests for Vulkan shader compilation.
 *
 * @domain `github.com/google/shaderc`
 * @programs `glslc`
 * @version `2026.1.0` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/google/shaderc`
 * @buildDependencies `cmake.org`, `python.org@~3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgoogleshaderc
 * console.log(pkg.name)        // "glslc"
 * console.log(pkg.description) // "A collection of tools, libraries, and tests for..."
 * console.log(pkg.programs)    // ["glslc"]
 * console.log(pkg.versions[0]) // "2026.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/google/shaderc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const shadercPackage = {
  /**
  * The display name of this package.
  */
  name: 'glslc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/google/shaderc' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A collection of tools, libraries, and tests for Vulkan shader compilation.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/google/shaderc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/shaderc' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/google/shaderc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/google/shaderc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/google/shaderc' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'glslc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
    'python.org@~3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2026.1.0',
    '2025.5.0',
    '2025.4.0',
    '2025.3.0',
    '2025.2.0',
    '2025.1.0',
    '2024.4.0',
    '2024.3.0',
    '2024.2.0',
    '2024.1.0',
    '2024.0.0',
    '2023.8.0',
  ] as const,
  aliases: [] as const,
}

export type ShadercPackage = typeof shadercPackage
