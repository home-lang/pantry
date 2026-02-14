/**
 * **mosh** - Remote terminal application
 *
 * @domain `mosh.org`
 * @programs `mosh-client`, `mosh-server`
 * @version `1.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mosh.org`
 * @homepage https://mosh.org
 * @dependencies `protobuf.dev@26.1.0`, `invisible-island.net/ncurses@6`, `zlib.net@1.3`, ... (+1 more) (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.moshorg
 * console.log(pkg.name)        // "mosh"
 * console.log(pkg.description) // "Remote terminal application"
 * console.log(pkg.programs)    // ["mosh-client", "mosh-server"]
 * console.log(pkg.versions[0]) // "1.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mosh-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const moshorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'mosh' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mosh.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Remote terminal application' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mosh.org/package.yml' as const,
  homepageUrl: 'https://mosh.org' as const,
  githubUrl: 'https://github.com/mobile-shell/mosh' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mosh.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mosh.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mosh.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mosh-client',
    'mosh-server',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'protobuf.dev@26.1.0',
    'invisible-island.net/ncurses@6',
    'zlib.net@1.3',
    'linux:openssl.org@3',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.0',
  ] as const,
  aliases: [] as const,
}

export type MoshorgPackage = typeof moshorgPackage
