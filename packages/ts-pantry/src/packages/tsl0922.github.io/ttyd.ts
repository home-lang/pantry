/**
 * **ttyd** - Command-line tool for sharing terminal over the web
 *
 * @domain `tsl0922.github.io/ttyd`
 * @programs `ttyd`
 * @version `1.7.7` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tsl0922.github.io/ttyd`
 * @homepage https://tsl0922.github.io/ttyd/
 * @dependencies `libuv.org@1`, `github.com/json-c/json-c^0.16`, `libwebsockets.org~4.3 # ABI version changes in 4.4`, ... (+1 more)
 * @buildDependencies `cmake.org@3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tsl0922githubiottyd
 * console.log(pkg.name)        // "ttyd"
 * console.log(pkg.description) // "Command-line tool for sharing terminal over the..."
 * console.log(pkg.programs)    // ["ttyd"]
 * console.log(pkg.versions[0]) // "1.7.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tsl0922-github-io/ttyd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tsl0922githubiottydPackage = {
  /**
  * The display name of this package.
  */
  name: 'ttyd' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tsl0922.github.io/ttyd' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Command-line tool for sharing terminal over the web' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tsl0922.github.io/ttyd/package.yml' as const,
  homepageUrl: 'https://tsl0922.github.io/ttyd/' as const,
  githubUrl: 'https://github.com/tsl0922/ttyd' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install tsl0922.github.io/ttyd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tsl0922.github.io/ttyd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tsl0922.github.io/ttyd' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ttyd',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libuv.org@1',
    'github.com/json-c/json-c^0.16',
    'libwebsockets.org~4.3 # ABI version changes in 4.4',
    'zlib.net@1',
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
    '1.7.7',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.2',
  ] as const,
  aliases: [] as const,
}

export type Tsl0922githubiottydPackage = typeof tsl0922githubiottydPackage
