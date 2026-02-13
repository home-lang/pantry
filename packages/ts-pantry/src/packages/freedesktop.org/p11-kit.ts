/**
 * **p11-kit** - Provides a way to load and enumerate PKCS#11 modules.
 *
 * @domain `freedesktop.org/p11-kit`
 * @programs `p11-kit`, `trust`
 * @version `0.26.1` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/p11-kit`
 * @homepage https://p11-glue.freedesktop.org
 * @dependencies `sourceware.org/libffi^3`, `curl.se/ca-certs`, `gnu.org/libtasn1^4`, ... (+1 more)
 * @buildDependencies `python.org@3`, `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgp11kit
 * console.log(pkg.name)        // "p11-kit"
 * console.log(pkg.description) // "Provides a way to load and enumerate PKCS#11 mo..."
 * console.log(pkg.programs)    // ["p11-kit", "trust"]
 * console.log(pkg.versions[0]) // "0.26.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/p11-kit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgp11kitPackage = {
  /**
   * The display name of this package.
   */
  name: 'p11-kit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/p11-kit' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Provides a way to load and enumerate PKCS#11 modules.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/p11-kit/package.yml' as const,
  homepageUrl: 'https://p11-glue.freedesktop.org' as const,
  githubUrl: 'https://github.com/p11-glue/p11-kit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/p11-kit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/p11-kit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/p11-kit' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'p11-kit',
    'trust',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'sourceware.org/libffi^3',
    'curl.se/ca-certs',
    'gnu.org/libtasn1^4',
    'gnu.org/gettext',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@3',
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.26.1',
    '0.26.0',
    '0.25.10',
    '0.25.9',
    '0.25.8',
    '0.25.7',
    '0.25.6',
    '0.25.5',
    '0.25.4',
    '0.25.3',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.1',
  ] as const,
  aliases: [] as const,
}

export type Freedesktoporgp11kitPackage = typeof freedesktoporgp11kitPackage
