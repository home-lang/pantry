/**
 * **gvisor-tap-vsock** - A new network stack based on gVisor
 *
 * @domain `github.com/containers/gvisor-tap-vsock`
 * @programs `gvproxy`, `qemu-wrapper`
 * @version `0.8.7` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/containers/gvisor-tap-vsock`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcontainersgvisortapvsock
 * console.log(pkg.name)        // "gvisor-tap-vsock"
 * console.log(pkg.description) // "A new network stack based on gVisor"
 * console.log(pkg.programs)    // ["gvproxy", "qemu-wrapper"]
 * console.log(pkg.versions[0]) // "0.8.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/containers/gvisor-tap-vsock.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gvisortapvsockPackage = {
  /**
   * The display name of this package.
   */
  name: 'gvisor-tap-vsock' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/containers/gvisor-tap-vsock' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A new network stack based on gVisor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/containers/gvisor-tap-vsock/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/containers/gvisor-tap-vsock' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/containers/gvisor-tap-vsock' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/containers/gvisor-tap-vsock -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/containers/gvisor-tap-vsock' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gvproxy',
    'qemu-wrapper',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.7',
    '0.8.6',
    '0.8.5',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.5',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.2',
    '0.6.1',
  ] as const,
  aliases: [] as const,
}

export type GvisortapvsockPackage = typeof gvisortapvsockPackage
