/**
 * **miniupnp.free.fr** - pkgx package
 *
 * @domain `miniupnp.free.fr`
 * @programs `external-ip`, `upnp-listdevices`, `upnpc`
 * @version `2.3.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install miniupnp.free.fr`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.miniupnpfreefr
 * console.log(pkg.name)        // "miniupnp.free.fr"
 * console.log(pkg.programs)    // ["external-ip", "upnp-listdevices", ...]
 * console.log(pkg.versions[0]) // "2.3.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/miniupnp-free-fr.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const miniupnpfreefrPackage = {
  /**
  * The display name of this package.
  */
  name: 'miniupnp.free.fr' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'miniupnp.free.fr' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/miniupnp.free.fr/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install miniupnp.free.fr' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +miniupnp.free.fr -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install miniupnp.free.fr' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'external-ip',
    'upnp-listdevices',
    'upnpc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.3.3',
  ] as const,
  aliases: [] as const,
}

export type MiniupnpfreefrPackage = typeof miniupnpfreefrPackage
