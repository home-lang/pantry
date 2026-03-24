/**
 * **terragrunt** - Terragrunt is a flexible orchestration tool that allows Infrastructure as Code written in OpenTofu/Terraform to scale.
 *
 * @domain `terragrunt.gruntwork.io`
 * @programs `terragrunt`
 * @version `0.99.4` (425 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install terragrunt.gruntwork.io`
 * @homepage https://terragrunt.gruntwork.io/
 * @dependencies `terraform.io`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.terragruntgruntworkio
 * console.log(pkg.name)        // "terragrunt"
 * console.log(pkg.description) // "Terragrunt is a flexible orchestration tool tha..."
 * console.log(pkg.programs)    // ["terragrunt"]
 * console.log(pkg.versions[0]) // "0.99.4" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/terragrunt-gruntwork-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const terragruntgruntworkioPackage = {
  /**
  * The display name of this package.
  */
  name: 'terragrunt' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'terragrunt.gruntwork.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Terragrunt is a flexible orchestration tool that allows Infrastructure as Code written in OpenTofu/Terraform to scale.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/terragrunt.gruntwork.io/package.yml' as const,
  homepageUrl: 'https://terragrunt.gruntwork.io/' as const,
  githubUrl: 'https://github.com/gruntwork-io/terragrunt' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install terragrunt.gruntwork.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +terragrunt.gruntwork.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install terragrunt.gruntwork.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'terragrunt',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'terraform.io',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.99.4',
    '0.99.3',
    '0.99.2',
    '0.99.1',
    '0.99.0',
    '0.98.0',
    '0.97.2',
    '0.97.1',
    '0.97.0',
    '0.96.1',
    '0.96.0',
    '0.95.1',
    '0.95.0',
    '0.94.0',
    '0.93.13',
    '0.93.12',
    '0.93.11',
    '0.93.10',
    '0.93.9',
    '0.93.8',
    '0.93.7',
    '0.93.6',
  ] as const,
  aliases: [] as const,
}

export type TerragruntgruntworkioPackage = typeof terragruntgruntworkioPackage
