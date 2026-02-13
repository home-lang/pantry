/**
 * **libsodium** - pkgx package
 *
 * @domain `libsodium.org`
 * @version `1.0.21` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libsodium.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libsodiumorg
 * console.log(pkg.name)        // "libsodium"
 * console.log(pkg.versions[0]) // "1.0.21" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libsodium-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libsodiumorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libsodium' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libsodium.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libsodium.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libsodium.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libsodium.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libsodium.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.21',
    '1.0.20',
    '1.0.19',
    '1.0.18',
    '1.0.17',
  ] as const,
  aliases: [] as const,
}

export type LibsodiumorgPackage = typeof libsodiumorgPackage
