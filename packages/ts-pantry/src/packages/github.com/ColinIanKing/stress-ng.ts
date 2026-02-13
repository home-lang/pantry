/**
 * **stress-ng** - This is the stress-ng upstream project git repository.  stress-ng will stress test a computer system in various selectable ways. It was designed to exercise various physical subsystems of a computer as well as the various operating system kernel interfaces.
 *
 * @domain `github.com/ColinIanKing/stress-ng`
 * @programs `stress-ng`
 * @version `0.20.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/ColinIanKing/stress-ng`
 * @homepage https://wiki.ubuntu.com/Kernel/Reference/stress-ng
 * @dependencies `github.com/besser82/libxcrypt`, `zlib.net`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcoliniankingstressng
 * console.log(pkg.name)        // "stress-ng"
 * console.log(pkg.description) // "This is the stress-ng upstream project git repo..."
 * console.log(pkg.programs)    // ["stress-ng"]
 * console.log(pkg.versions[0]) // "0.20.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/ColinIanKing/stress-ng.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const stressngPackage = {
  /**
   * The display name of this package.
   */
  name: 'stress-ng' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/ColinIanKing/stress-ng' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'This is the stress-ng upstream project git repository.  stress-ng will stress test a computer system in various selectable ways. It was designed to exercise various physical subsystems of a computer as well as the various operating system kernel interfaces. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ColinIanKing/stress-ng/package.yml' as const,
  homepageUrl: 'https://wiki.ubuntu.com/Kernel/Reference/stress-ng' as const,
  githubUrl: 'https://github.com/ColinIanKing/stress-ng' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/ColinIanKing/stress-ng' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/ColinIanKing/stress-ng -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/ColinIanKing/stress-ng' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'stress-ng',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'github.com/besser82/libxcrypt',
    'zlib.net',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.20.0',
    '0.19.6',
    '0.19.5',
    '0.19.4',
    '0.19.3',
    '0.19.2',
    '0.19.1',
  ] as const,
  aliases: [] as const,
}

export type StressngPackage = typeof stressngPackage
