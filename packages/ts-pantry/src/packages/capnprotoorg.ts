/**
 * **capnproto** - pkgx package
 *
 * @domain `capnproto.org`
 * @version `1.3.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install capnproto.org`
 * @dependencies `zlib.net`, `linux:openssl.org^1.1` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.capnprotoorg
 * console.log(pkg.name)        // "capnproto"
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/capnproto-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const capnprotoorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'capnproto' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'capnproto.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/capnproto.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install capnproto.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +capnproto.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install capnproto.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'zlib.net',
    'linux:openssl.org^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.0',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type CapnprotoorgPackage = typeof capnprotoorgPackage
