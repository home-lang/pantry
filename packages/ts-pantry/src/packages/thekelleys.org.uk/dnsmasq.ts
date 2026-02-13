/**
 * **dnsmasq** - pkgx package
 *
 * @domain `thekelleys.org.uk/dnsmasq`
 * @programs `dnsmasq`
 * @version `2.92.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install thekelleys.org.uk/dnsmasq`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.thekelleysorgukdnsmasq
 * console.log(pkg.name)        // "dnsmasq"
 * console.log(pkg.programs)    // ["dnsmasq"]
 * console.log(pkg.versions[0]) // "2.92.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/thekelleys-org-uk/dnsmasq.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const thekelleysorgukdnsmasqPackage = {
  /**
   * The display name of this package.
   */
  name: 'dnsmasq' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'thekelleys.org.uk/dnsmasq' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/thekelleys.org.uk/dnsmasq/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install thekelleys.org.uk/dnsmasq' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +thekelleys.org.uk/dnsmasq -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install thekelleys.org.uk/dnsmasq' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dnsmasq',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.92.0',
    '2.91.0',
    '2.90.0',
    '2.89.0',
  ] as const,
  aliases: [] as const,
}

export type ThekelleysorgukdnsmasqPackage = typeof thekelleysorgukdnsmasqPackage
