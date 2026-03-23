/**
 * **terraform** - Terraform enables you to safely and predictably create, change, and improve infrastructure. It is a source-available tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.
 *
 * @domain `terraform.io`
 * @programs `terraform`
 * @version `1.14.7` (89 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install terraform.io`
 * @name `terraform`
 * @homepage https://www.terraform.io
 * @buildDependencies `go.dev@~1.24.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access the package
 * const pkg = pantry.terraform
 * // Or access via domain
 * const samePkg = pantry.terraformio
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "terraform"
 * console.log(pkg.description) // "Terraform enables you to safely and predictably..."
 * console.log(pkg.programs)    // ["terraform"]
 * console.log(pkg.versions[0]) // "1.14.7" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/terraform-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const terraformPackage = {
  /**
  * The display name of this package.
  */
  name: 'terraform' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'terraform.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Terraform enables you to safely and predictably create, change, and improve infrastructure. It is a source-available tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/terraform.io/package.yml' as const,
  homepageUrl: 'https://www.terraform.io' as const,
  githubUrl: 'https://github.com/hashicorp/terraform' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install terraform.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +terraform.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install terraform.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'terraform',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.24.1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.14.7',
    '1.14.6',
    '1.14.5',
    '1.14.4',
    '1.14.3',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.5',
    '1.13.4',
    '1.13.3',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.4',
    '1.11.3',
    '1.11.2',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [] as const,
}

export type TerraformPackage = typeof terraformPackage
