/**
 * **babashka** - pkgx package
 *
 * @domain `babashka.org`
 * @version `1.12.214` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install babashka.org`
 * @buildDependencies `pkgx.sh` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.babashkaorg
 * console.log(pkg.name)        // "babashka"
 * console.log(pkg.versions[0]) // "1.12.214" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/babashka-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const babashkaorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'babashka' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'babashka.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/babashka.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install babashka.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +babashka.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install babashka.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'pkgx.sh',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.12.214',
    '1.12.213',
  ] as const,
  aliases: [] as const,
}

export type BabashkaorgPackage = typeof babashkaorgPackage
