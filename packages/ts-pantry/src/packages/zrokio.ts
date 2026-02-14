/**
 * **zrok** - Geo-scale, next-generation peer-to-peer sharing platform built on top of OpenZiti.
 *
 * @domain `zrok.io`
 * @programs `zrok`, `copyto`, `pastefrom`
 * @version `1.1.11` (51 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install zrok.io`
 * @homepage https://zrok.io
 * @buildDependencies `go.dev@~1.23.0`, `nodejs.org@^21`, `npmjs.com@^10` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.zrokio
 * console.log(pkg.name)        // "zrok"
 * console.log(pkg.description) // "Geo-scale, next-generation peer-to-peer sharing..."
 * console.log(pkg.programs)    // ["zrok", "copyto", ...]
 * console.log(pkg.versions[0]) // "1.1.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/zrok-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zrokioPackage = {
  /**
  * The display name of this package.
  */
  name: 'zrok' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'zrok.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Geo-scale, next-generation peer-to-peer sharing platform built on top of OpenZiti.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/zrok.io/package.yml' as const,
  homepageUrl: 'https://zrok.io' as const,
  githubUrl: 'https://github.com/openziti/zrok' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install zrok.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +zrok.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install zrok.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'zrok',
    'copyto',
    'pastefrom',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.23.0',
    'nodejs.org@^21',
    'npmjs.com@^10',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.11',
    '1.1.10',
    '1.1.9',
    '1.1.8',
    '1.1.7',
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.8',
    '1.0.7',
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.4.49',
    '0.4.48',
    '0.4.47',
    '0.4.46',
    '0.4.45',
    '0.4.44',
    '0.4.42',
    '0.4.41',
    '0.4.40',
    '0.4.39',
    '0.4.38',
    '0.4.37',
    '0.4.36',
    '0.4.35',
    '0.4.34',
    '0.4.33',
    '0.4.32',
    '0.4.31',
    '0.4.30',
    '0.4.29',
    '0.4.27',
    '0.4.26',
    '0.4.25',
    '0.4.24',
    '0.4.23',
    '0.4.22',
    '0.4.20',
    '0.4.19',
    '0.4.18',
    '0.4.17',
    '0.4.16',
  ] as const,
  aliases: [] as const,
}

export type ZrokioPackage = typeof zrokioPackage
