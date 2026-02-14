/**
 * **ny** - 🗽 Fast, Proxy Package Manager for JavaScript
 *
 * @domain `github.com/krzkaczor/ny`
 * @programs `ny`
 * @version `0.2.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/krzkaczor/ny`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkrzkaczorny
 * console.log(pkg.name)        // "ny"
 * console.log(pkg.description) // "🗽 Fast, Proxy Package Manager for JavaScript"
 * console.log(pkg.programs)    // ["ny"]
 * console.log(pkg.versions[0]) // "0.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/krzkaczor/ny.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nyPackage = {
  /**
  * The display name of this package.
  */
  name: 'ny' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/krzkaczor/ny' as const,
  /**
  * Brief description of what this package does.
  */
  description: '🗽 Fast, Proxy Package Manager for JavaScript' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/krzkaczor/ny/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/krzkaczor/ny' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/krzkaczor/ny' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/krzkaczor/ny -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/krzkaczor/ny' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ny',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.2',
    '0.1.1',
  ] as const,
  aliases: [] as const,
}

export type NyPackage = typeof nyPackage
