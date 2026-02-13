/**
 * **node** - Platform built on V8 to build network applications
 *
 * @domain `nodejs.org`
 * @programs `node`
 * @version `25.4.0` (167 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install nodejs.org`
 * @name `node`
 * @homepage https://nodejs.org/
 * @dependencies `unicode.org^73 # v25`, `openssl.org@1.1`, `zlib.net@1`, ... (+1 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `python.org@~3.9`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access the package
 * const pkg = pantry.node
 * // Or access via domain
 * const samePkg = pantry.nodejsorg
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "node"
 * console.log(pkg.description) // "Platform built on V8 to build network applications"
 * console.log(pkg.programs)    // ["node"]
 * console.log(pkg.versions[0]) // "25.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nodejs-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nodePackage = {
  /**
   * The display name of this package.
   */
  name: 'node' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'nodejs.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Platform built on V8 to build network applications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org/package.yml' as const,
  homepageUrl: 'https://nodejs.org/' as const,
  githubUrl: 'https://github.com/nodejs/node' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install nodejs.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +nodejs.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nodejs.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'node',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'unicode.org^73 # v25',
    'openssl.org@1.1',
    'zlib.net@1',
    'linux:gnu.org/gcc/libstdcxx',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'python.org@~3.9',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '25.4.0',
    '25.3.0',
    '25.2.1',
    '24.13.0',
    '24.12.0',
    '24.11.1',
    '24.11.0',
    '24.10.0',
    '24.9.0',
    '24.8.0',
    '24.7.0',
    '24.6.0',
    '24.5.0',
    '24.4.1',
    '24.4.0',
    '24.3.0',
    '24.2.0',
    '24.1.0',
    '24.0.2',
    '24.0.1',
    '24.0.0',
    '23.11.1',
    '23.11.0',
    '23.10.0',
    '23.9.0',
    '23.8.0',
    '23.7.0',
    '23.6.1',
    '23.6.0',
    '23.5.0',
    '23.4.0',
    '23.3.0',
    '23.2.0',
    '23.1.0',
    '23.0.0',
    '22.22.0',
    '22.21.1',
    '22.21.0',
    '22.20.0',
    '22.19.0',
    '22.18.0',
    '22.17.1',
    '22.17.0',
    '22.16.0',
    '22.15.1',
    '22.15.0',
    '22.14.0',
    '22.13.1',
    '22.13.0',
    '22.12.0',
    '22.11.0',
    '22.10.0',
    '22.9.0',
    '22.8.0',
    '22.7.0',
    '22.6.0',
    '22.5.1',
    '22.5.0',
    '22.4.1',
    '22.4.0',
    '22.3.0',
    '22.2.0',
    '22.1.0',
    '22.0.0',
    '21.7.3',
    '21.7.2',
    '21.7.1',
    '21.7.0',
    '21.6.2',
    '21.6.1',
    '21.6.0',
    '21.5.0',
    '21.4.0',
    '21.3.0',
    '21.2.0',
    '21.1.0',
    '21.0.0',
    '20.20.0',
    '20.19.6',
    '20.19.5',
    '20.19.4',
    '20.19.3',
    '20.19.2',
    '20.19.1',
    '20.19.0',
    '20.18.3',
    '20.18.2',
    '20.18.1',
    '20.18.0',
    '20.17.0',
    '20.16.0',
    '20.15.1',
    '20.15.0',
    '20.14.0',
    '20.13.1',
    '20.13.0',
    '20.12.2',
    '20.12.1',
    '20.11.1',
    '20.11.0',
    '20.10.0',
    '20.9.0',
    '20.8.1',
    '20.8.0',
    '20.7.0',
    '20.6.1',
    '20.6.0',
    '20.5.1',
    '20.5.0',
    '20.4.0',
    '20.3.1',
    '20.3.0',
    '20.2.0',
    '20.1.0',
    '20.0.0',
    '19.9.0',
    '19.8.1',
    '19.8.0',
    '19.7.0',
    '19.6.1',
    '19.6.0',
    '19.5.0',
    '19.4.0',
    '19.3.0',
    '19.2.0',
    '19.1.0',
    '19.0.1',
    '19.0.0',
    '18.20.8',
    '18.20.7',
    '18.20.6',
    '18.20.5',
    '18.20.4',
    '18.20.3',
    '18.20.2',
    '18.20.1',
    '18.20.0',
    '18.19.1',
    '18.19.0',
    '18.18.2',
    '18.18.1',
    '18.18.0',
    '18.17.1',
    '18.17.0',
    '18.16.1',
    '18.16.0',
    '18.15.0',
    '18.14.2',
    '18.14.0',
    '18.13.0',
    '18.12.1',
    '18.9.1',
    '16.20.2',
    '16.20.1',
    '16.20.0',
    '16.19.1',
    '16.19.0',
    '16.18.1',
    '16.18.0',
    '16.13.0',
    '16.11.1',
    '14.21.3',
    '14.21.2',
    '14.21.1',
    '14.21.0',
    '14.20.1',
    '12.22.12',
  ] as const,
  /**
   * Alternative names for this package.
   * You can use any of these names to access the package.
   */
  aliases: [] as const,
}

export type NodePackage = typeof nodePackage
