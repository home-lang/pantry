/**
 * **coder** - Tool for provisioning self-hosted development environments with Terraform
 *
 * @domain `coder.com`
 * @programs `coder`
 * @version `2.31.5` (129 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install coder.com`
 * @homepage https://coder.com
 * @buildDependencies `go.dev@~1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.codercom
 * console.log(pkg.name)        // "coder"
 * console.log(pkg.description) // "Tool for provisioning self-hosted development e..."
 * console.log(pkg.programs)    // ["coder"]
 * console.log(pkg.versions[0]) // "2.31.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/coder-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const codercomPackage = {
  /**
  * The display name of this package.
  */
  name: 'coder' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'coder.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tool for provisioning self-hosted development environments with Terraform' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/coder.com/package.yml' as const,
  homepageUrl: 'https://coder.com' as const,
  githubUrl: 'https://github.com/coder/coder' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install coder.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +coder.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install coder.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'coder',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.32.0',
    '2.31.9',
    '2.31.8',
    '2.31.7',
    '2.31.6',
    '2.31.5',
    '2.31.4',
    '2.31.3',
    '2.31.2',
    '2.31.1',
    '2.30.7',
    '2.30.6',
    '2.30.5',
    '2.30.4',
    '2.30.3',
    '2.30.2',
    '2.30.1',
    '2.30.0',
    '2.29.10',
    '2.29.9',
    '2.29.8',
    '2.29.7',
    '2.29.6',
    '2.29.5',
    '2.29.4',
    '2.29.3',
    '2.29.2',
    '2.29.1',
    '2.29.0',
    '2.28.11',
    '2.28.10',
    '2.28.9',
    '2.28.8',
    '2.28.7',
    '2.28.6',
    '2.28.5',
    '2.28.4',
    '2.28.3',
    '2.28.2',
    '2.28.1',
    '2.28.0',
    '2.27.11',
    '2.27.10',
    '2.27.9',
    '2.27.8',
    '2.27.7',
    '2.27.6',
    '2.27.5',
    '2.27.4',
    '2.27.3',
    '2.27.2',
    '2.27.1',
    '2.27.0',
    '2.26.6',
    '2.26.5',
    '2.26.4',
    '2.26.3',
    '2.26.2',
    '2.26.1',
    '2.25.3',
  ] as const,
  aliases: [] as const,
}

export type CodercomPackage = typeof codercomPackage
