/**
 * **consul-template** - Template rendering, notifier, and supervisor for @HashiCorp Consul and Vault data.
 *
 * @domain `hashicorp.com/consul-template`
 * @programs `consul-template`
 * @version `0.41.3` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hashicorp.com/consul-template`
 * @homepage https://www.hashicorp.com/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hashicorpcomconsultemplate
 * console.log(pkg.name)        // "consul-template"
 * console.log(pkg.description) // "Template rendering, notifier, and supervisor fo..."
 * console.log(pkg.programs)    // ["consul-template"]
 * console.log(pkg.versions[0]) // "0.41.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hashicorp-com/consul-template.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hashicorpcomconsultemplatePackage = {
  /**
   * The display name of this package.
   */
  name: 'consul-template' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'hashicorp.com/consul-template' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Template rendering, notifier, and supervisor for @HashiCorp Consul and Vault data.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hashicorp.com/consul-template/package.yml' as const,
  homepageUrl: 'https://www.hashicorp.com/' as const,
  githubUrl: 'https://github.com/hashicorp/consul-template' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install hashicorp.com/consul-template' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hashicorp.com/consul-template -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hashicorp.com/consul-template' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'consul-template',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.41.3',
    '0.41.2',
    '0.41.1',
    '0.41.0',
    '0.40.0',
    '0.39.1',
    '0.39.0',
  ] as const,
  aliases: [] as const,
}

export type HashicorpcomconsultemplatePackage = typeof hashicorpcomconsultemplatePackage
