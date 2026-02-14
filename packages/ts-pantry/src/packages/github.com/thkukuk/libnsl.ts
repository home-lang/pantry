/**
 * **libnsl** - This library contains the public client interface for NIS(YP) and NIS+ in a IPv6 ready version
 *
 * @domain `github.com/thkukuk/libnsl`
 * @version `2.0.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/thkukuk/libnsl`
 * @dependencies `sourceforge.net/libtirpc`
 * @buildDependencies `gnu.org/gcc`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomthkukuklibnsl
 * console.log(pkg.name)        // "libnsl"
 * console.log(pkg.description) // "This library contains the public client interfa..."
 * console.log(pkg.versions[0]) // "2.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/thkukuk/libnsl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libnslPackage = {
  /**
  * The display name of this package.
  */
  name: 'libnsl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/thkukuk/libnsl' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'This library contains the public client interface for NIS(YP) and NIS+ in a IPv6 ready version' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/thkukuk/libnsl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/thkukuk/libnsl' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/thkukuk/libnsl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/thkukuk/libnsl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/thkukuk/libnsl' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'sourceforge.net/libtirpc',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/gcc',
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.0.1',
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type LibnslPackage = typeof libnslPackage
