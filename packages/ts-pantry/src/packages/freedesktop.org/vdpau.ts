/**
 * **vdpau** - pkgx package
 *
 * @domain `freedesktop.org/vdpau`
 * @version `1.5.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/vdpau`
 * @dependencies `x.org/x11`, `x.org/exts`, `x.org/protocol`
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgvdpau
 * console.log(pkg.name)        // "vdpau"
 * console.log(pkg.versions[0]) // "1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/vdpau.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgvdpauPackage = {
  /**
  * The display name of this package.
  */
  name: 'vdpau' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freedesktop.org/vdpau' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/vdpau/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install freedesktop.org/vdpau' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/vdpau -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/vdpau' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/x11',
    'x.org/exts',
    'x.org/protocol',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.5.0',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgvdpauPackage = typeof freedesktoporgvdpauPackage
