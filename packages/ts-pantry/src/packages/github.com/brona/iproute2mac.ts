/**
 * **iproute2mac** - CLI wrapper for basic network utilites on Mac OS X inspired with iproute2 on Linux systems - ip command.
 *
 * @domain `github.com/brona/iproute2mac`
 * @programs `bridge`, `ip`, `iproute2mac.py`
 * @version `1.7.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/brona/iproute2mac`
 * @dependencies `python.org~3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcombronaiproute2mac
 * console.log(pkg.name)        // "iproute2mac"
 * console.log(pkg.description) // "CLI wrapper for basic network utilites on Mac O..."
 * console.log(pkg.programs)    // ["bridge", "ip", ...]
 * console.log(pkg.versions[0]) // "1.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/brona/iproute2mac.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const iproute2macPackage = {
  /**
  * The display name of this package.
  */
  name: 'iproute2mac' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/brona/iproute2mac' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CLI wrapper for basic network utilites on Mac OS X inspired with iproute2 on Linux systems - ip command.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/brona/iproute2mac/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/brona/iproute2mac' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/brona/iproute2mac' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/brona/iproute2mac -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/brona/iproute2mac' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bridge',
    'ip',
    'iproute2mac.py',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'python.org~3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.7.0',
    '1.6.0',
    '1.5.4',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.1',
  ] as const,
  aliases: [] as const,
}

export type Iproute2macPackage = typeof iproute2macPackage
