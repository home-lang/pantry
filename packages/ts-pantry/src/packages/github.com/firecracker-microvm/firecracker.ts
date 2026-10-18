/**
 * **firecracker** - Native KVM microVM monitor and jailer.
 *
 * @domain `github.com/firecracker-microvm/firecracker`
 * @programs `firecracker`, `jailer`
 * @version `1.17.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/firecracker-microvm/firecracker`
 * @homepage https://firecracker-microvm.github.io
 * @buildDependencies `curl.se`, `stedolan.github.io/jq^1`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomfirecrackermicrovmfirecracker
 * console.log(pkg.name)        // "firecracker"
 * console.log(pkg.description) // "Native KVM microVM monitor and jailer."
 * console.log(pkg.programs)    // ["firecracker", "jailer"]
 * console.log(pkg.versions[0]) // "1.17.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/firecracker-microvm/firecracker.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const firecrackerPackage = {
  /**
  * The display name of this package.
  */
  name: 'firecracker' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/firecracker-microvm/firecracker' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Native KVM microVM monitor and jailer.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://firecracker-microvm.github.io' as const,
  githubUrl: 'https://github.com/firecracker-microvm/firecracker' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/firecracker-microvm/firecracker' as const,
  pantryInstallCommand: 'pantry install github.com/firecracker-microvm/firecracker' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'firecracker',
    'jailer',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
    'stedolan.github.io/jq^1',
    'gnu.org/coreutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.17.0',
  ] as const,
  aliases: [] as const,
}

export type FirecrackerPackage = typeof firecrackerPackage
