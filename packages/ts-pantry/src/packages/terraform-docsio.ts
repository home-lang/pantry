/**
 * **terraform-docs** - Generate documentation from Terraform modules in various output formats
 *
 * @domain `terraform-docs.io`
 * @programs `terraform-docs`
 * @version `0.21.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install terraform-docs.io`
 * @homepage https://terraform-docs.io
 * @buildDependencies `go.dev@^1.16` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.terraformdocsio
 * console.log(pkg.name)        // "terraform-docs"
 * console.log(pkg.description) // "Generate documentation from Terraform modules i..."
 * console.log(pkg.programs)    // ["terraform-docs"]
 * console.log(pkg.versions[0]) // "0.21.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/terraform-docs-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const terraformdocsioPackage = {
  /**
   * The display name of this package.
   */
  name: 'terraform-docs' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'terraform-docs.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generate documentation from Terraform modules in various output formats' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/terraform-docs.io/package.yml' as const,
  homepageUrl: 'https://terraform-docs.io' as const,
  githubUrl: 'https://github.com/terraform-docs/terraform-docs' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install terraform-docs.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +terraform-docs.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install terraform-docs.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'terraform-docs',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.16',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.21.0',
    '0.20.0',
    '0.19.0',
    '0.18.0',
    '0.17.0',
    '0.16.0',
  ] as const,
  aliases: [] as const,
}

export type TerraformdocsioPackage = typeof terraformdocsioPackage
