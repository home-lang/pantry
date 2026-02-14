/**
 * **libwebsockets** - canonical libwebsockets.org networking library
 *
 * @domain `libwebsockets.org`
 * @version `4.5.2` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libwebsockets.org`
 * @homepage https://libwebsockets.org
 * @dependencies `libuv.org@1`, `libevent.org@2`
 * @buildDependencies `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libwebsocketsorg
 * console.log(pkg.name)        // "libwebsockets"
 * console.log(pkg.description) // "canonical libwebsockets.org networking library"
 * console.log(pkg.versions[0]) // "4.5.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libwebsockets-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libwebsocketsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'libwebsockets' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libwebsockets.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'canonical libwebsockets.org networking library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libwebsockets.org/package.yml' as const,
  homepageUrl: 'https://libwebsockets.org' as const,
  githubUrl: 'https://github.com/warmcat/libwebsockets' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libwebsockets.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libwebsockets.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libwebsockets.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libuv.org@1',
    'libevent.org@2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.5.2',
    '4.5.1',
    '4.5.0',
    '4.4.2',
    '4.4.1',
    '4.4.0',
    '4.3.7',
    '4.3.6',
    '4.3.5',
    '4.3.4',
    '4.3.3',
    '4.3.2',
  ] as const,
  aliases: [] as const,
}

export type LibwebsocketsorgPackage = typeof libwebsocketsorgPackage
