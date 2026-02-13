/**
 * **usque** - Open-source reimplementation of the Cloudflare WARP client's MASQUE protocol.
 *
 * @domain `github.com/Diniboy1123/usque`
 * @programs `usque`
 * @version `1.4.2` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Diniboy1123/usque`
 * @buildDependencies `go.dev@~1.24.2`, `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomdiniboy1123usque
 * console.log(pkg.name)        // "usque"
 * console.log(pkg.description) // "Open-source reimplementation of the Cloudflare ..."
 * console.log(pkg.programs)    // ["usque"]
 * console.log(pkg.versions[0]) // "1.4.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Diniboy1123/usque.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const usquePackage = {
  /**
   * The display name of this package.
   */
  name: 'usque' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/Diniboy1123/usque' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open-source reimplementation of the Cloudflare WARP client\'s MASQUE protocol. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Diniboy1123/usque/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Diniboy1123/usque' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/Diniboy1123/usque' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Diniboy1123/usque -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Diniboy1123/usque' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'usque',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.24.2',
    'goreleaser.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.4',
  ] as const,
  aliases: [] as const,
}

export type UsquePackage = typeof usquePackage
