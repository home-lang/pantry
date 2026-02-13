/**
 * **nuclei** - Nuclei is a fast, customizable vulnerability scanner powered by the global security community and built on a simple YAML-based DSL, enabling collaboration to tackle trending vulnerabilities on the internet. It helps you find vulnerabilities in your applications, APIs, networks, DNS, and cloud configurations.
 *
 * @domain `projectdiscovery.io/nuclei`
 * @programs `nuclei`
 * @version `3.6.2` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install projectdiscovery.io/nuclei`
 * @homepage https://nuclei.projectdiscovery.io/
 * @buildDependencies `go.dev@~1.22.2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.projectdiscoveryionuclei
 * console.log(pkg.name)        // "nuclei"
 * console.log(pkg.description) // "Nuclei is a fast, customizable vulnerability sc..."
 * console.log(pkg.programs)    // ["nuclei"]
 * console.log(pkg.versions[0]) // "3.6.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/projectdiscovery-io/nuclei.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const projectdiscoveryionucleiPackage = {
  /**
   * The display name of this package.
   */
  name: 'nuclei' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'projectdiscovery.io/nuclei' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Nuclei is a fast, customizable vulnerability scanner powered by the global security community and built on a simple YAML-based DSL, enabling collaboration to tackle trending vulnerabilities on the internet. It helps you find vulnerabilities in your applications, APIs, networks, DNS, and cloud configurations.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/projectdiscovery.io/nuclei/package.yml' as const,
  homepageUrl: 'https://nuclei.projectdiscovery.io/' as const,
  githubUrl: 'https://github.com/projectdiscovery/nuclei' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install projectdiscovery.io/nuclei' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +projectdiscovery.io/nuclei -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install projectdiscovery.io/nuclei' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nuclei',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.22.2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.1',
    '3.5.0',
    '3.4.10',
    '3.4.9',
    '3.4.8',
    '3.4.7',
    '3.4.6',
    '3.4.5',
    '3.4.4',
    '3.4.3',
    '3.4.2',
  ] as const,
  aliases: [] as const,
}

export type ProjectdiscoveryionucleiPackage = typeof projectdiscoveryionucleiPackage
