/**
 * **opa** - Open Policy Agent (OPA) is an open source, general-purpose policy engine.
 *
 * @domain `openpolicyagent.org`
 * @programs `opa`
 * @version `1.12.3` (39 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openpolicyagent.org`
 * @homepage https://www.openpolicyagent.org
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openpolicyagentorg
 * console.log(pkg.name)        // "opa"
 * console.log(pkg.description) // "Open Policy Agent (OPA) is an open source, gene..."
 * console.log(pkg.programs)    // ["opa"]
 * console.log(pkg.versions[0]) // "1.12.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openpolicyagent-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openpolicyagentorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'opa' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openpolicyagent.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open Policy Agent (OPA) is an open source, general-purpose policy engine.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openpolicyagent.org/package.yml' as const,
  homepageUrl: 'https://www.openpolicyagent.org' as const,
  githubUrl: 'https://github.com/open-policy-agent/opa' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openpolicyagent.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openpolicyagent.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openpolicyagent.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'opa',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.12.3',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.1',
    '1.11.0',
    '1.10.1',
    '1.10.0',
    '1.9.0',
    '1.8.0',
    '1.7.1',
    '1.7.0',
    '1.6.0',
    '1.5.1',
    '1.5.0',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.70.0',
    '0.69.0',
    '0.68.0',
    '0.67.1',
    '0.67.0',
    '0.66.0',
    '0.65.0',
    '0.64.1',
    '0.64.0',
    '0.63.0',
    '0.62.1',
    '0.62.0',
    '0.61.0',
    '0.60.0',
    '0.59.0',
    '0.58.0',
  ] as const,
  aliases: [] as const,
}

export type OpenpolicyagentorgPackage = typeof openpolicyagentorgPackage
