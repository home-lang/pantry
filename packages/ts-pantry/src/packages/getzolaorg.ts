/**
 * **zola** - A fast static site generator in a single binary with everything built-in. https://www.getzola.org
 *
 * @domain `getzola.org`
 * @programs `zola`
 * @version `0.22.1` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install getzola.org`
 * @homepage https://www.getzola.org/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.getzolaorg
 * console.log(pkg.name)        // "zola"
 * console.log(pkg.description) // "A fast static site generator in a single binary..."
 * console.log(pkg.programs)    // ["zola"]
 * console.log(pkg.versions[0]) // "0.22.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/getzola-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const getzolaorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'zola' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'getzola.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A fast static site generator in a single binary with everything built-in. https://www.getzola.org' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/getzola.org/package.yml' as const,
  homepageUrl: 'https://www.getzola.org/' as const,
  githubUrl: 'https://github.com/getzola/zola' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install getzola.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +getzola.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install getzola.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'zola',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.22.1',
    '0.22.0',
    '0.21.0',
    '0.20.0',
    '0.19.2',
    '0.19.1',
    '0.19.0',
    '0.18.0',
    '0.17.2',
  ] as const,
  aliases: [] as const,
}

export type GetzolaorgPackage = typeof getzolaorgPackage
