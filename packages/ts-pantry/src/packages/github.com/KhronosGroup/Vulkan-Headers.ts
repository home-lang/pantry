/**
 * **Vulkan-Headers** - Vulkan header files and API registry
 *
 * @domain `github.com/KhronosGroup/Vulkan-Headers`
 * @version `1.4.340` (89 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/KhronosGroup/Vulkan-Headers`
 * @homepage https://www.vulkan.org/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkhronosgroupvulkanheaders
 * console.log(pkg.name)        // "Vulkan-Headers"
 * console.log(pkg.description) // "Vulkan header files and API registry"
 * console.log(pkg.versions[0]) // "1.4.340" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/KhronosGroup/Vulkan-Headers.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const vulkanheadersPackage = {
  /**
   * The display name of this package.
   */
  name: 'Vulkan-Headers' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/KhronosGroup/Vulkan-Headers' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Vulkan header files and API registry' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/KhronosGroup/Vulkan-Headers/package.yml' as const,
  homepageUrl: 'https://www.vulkan.org/' as const,
  githubUrl: 'https://github.com/KhronosGroup/Vulkan-Headers' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/KhronosGroup/Vulkan-Headers' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/KhronosGroup/Vulkan-Headers -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/KhronosGroup/Vulkan-Headers' as const,
  programs: [] as const,
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
    '1.4.340',
    '1.4.339',
    '1.4.338',
    '1.4.337',
    '1.4.336',
    '1.4.335',
    '1.4.334',
    '1.4.333',
    '1.4.332',
    '1.4.331',
    '1.4.330',
    '1.4.329',
    '1.4.328',
    '1.4.327',
    '1.4.326',
    '1.4.325',
    '1.4.324',
    '1.4.323',
    '1.4.322',
    '1.4.321',
    '1.4.320',
    '1.4.319',
    '1.4.318',
    '1.4.317',
    '1.4.316',
    '1.4.315',
    '1.4.314',
    '1.4.313',
    '1.4.312',
    '1.4.311',
    '1.4.310',
    '1.4.309',
    '1.4.307',
    '1.4.306',
    '1.4.305',
    '1.4.304',
    '1.4.303',
    '1.4.230',
    '1.3.302',
    '1.3.301',
    '1.3.300',
    '1.3.299',
    '1.3.298',
    '1.3.297',
    '1.3.296',
    '1.3.295',
    '1.3.294',
    '1.3.293',
    '1.3.292',
    '1.3.291',
    '1.3.290',
    '1.3.289',
    '1.3.288',
    '1.3.287',
    '1.3.286',
    '1.3.285',
    '1.3.284',
    '1.3.283',
    '1.3.282',
    '1.3.281',
    '1.3.280',
    '1.3.279',
    '1.3.278',
    '1.3.277',
    '1.3.276',
    '1.3.275',
    '1.3.274',
    '1.3.273',
    '1.3.272',
    '1.3.271',
    '1.3.270',
    '1.3.269',
    '1.3.268',
    '1.3.267',
    '1.3.266',
    '1.3.265',
    '1.3.264',
    '1.3.263',
    '1.3.262',
    '1.3.261',
    '1.3.260',
    '1.3.259',
    '1.3.258',
    '1.3.257',
    '1.3.256',
    '1.3.255',
    '1.3.254',
    '1.3.253',
    '1.3.252',
  ] as const,
  aliases: [] as const,
}

export type VulkanheadersPackage = typeof vulkanheadersPackage
