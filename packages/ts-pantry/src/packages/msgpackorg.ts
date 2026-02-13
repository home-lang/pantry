/**
 * **msgpack** - MessagePack implementation for C and C++ / msgpack.org[C/C++]
 *
 * @domain `msgpack.org`
 * @version `6.0.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install msgpack.org`
 * @buildDependencies `cmake.org`, `google.com/googletest` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.msgpackorg
 * console.log(pkg.name)        // "msgpack"
 * console.log(pkg.description) // "MessagePack implementation for C and C++ / msgp..."
 * console.log(pkg.versions[0]) // "6.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/msgpack-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const msgpackorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'msgpack' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'msgpack.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'MessagePack implementation for C and C++ / msgpack.org[C/C++]' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/msgpack.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/msgpack/msgpack-c' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install msgpack.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +msgpack.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install msgpack.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
    'google.com/googletest',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '6.0.2',
    '6.0.1',
    '6.0.0',
  ] as const,
  aliases: [] as const,
}

export type MsgpackorgPackage = typeof msgpackorgPackage
