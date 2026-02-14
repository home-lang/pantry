/**
 * **libuv** - Cross-platform asynchronous I/O
 *
 * @domain `libuv.org`
 * @version `1.52.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libuv.org`
 * @homepage https://libuv.org/
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libuvorg
 * console.log(pkg.name)        // "libuv"
 * console.log(pkg.description) // "Cross-platform asynchronous I/O"
 * console.log(pkg.versions[0]) // "1.52.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libuv-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libuvorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'libuv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libuv.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Cross-platform asynchronous I/O' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libuv.org/package.yml' as const,
  homepageUrl: 'https://libuv.org/' as const,
  githubUrl: 'https://github.com/libuv/libuv' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libuv.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libuv.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libuv.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.52.0',
    '1.51.0',
    '1.50.0',
    '1.49.2',
    '1.49.1',
    '1.49.0',
    '1.48.0',
    '1.47.0',
    '1.46.0',
    '1.45.0',
    '1.44.2',
  ] as const,
  aliases: [] as const,
}

export type LibuvorgPackage = typeof libuvorgPackage
