/**
 * **socat** - SOcket CAT: netcat on steroids
 *
 * @domain `dest-unreach.org/socat`
 * @programs `socat`
 * @version `1.8.1.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dest-unreach.org/socat`
 * @homepage http://www.dest-unreach.org/socat/
 * @dependencies `openssl.org^1.1`, `gnu.org/readline^8.2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.destunreachorgsocat
 * console.log(pkg.name)        // "socat"
 * console.log(pkg.description) // "SOcket CAT: netcat on steroids"
 * console.log(pkg.programs)    // ["socat"]
 * console.log(pkg.versions[0]) // "1.8.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dest-unreach-org/socat.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const destunreachorgsocatPackage = {
  /**
  * The display name of this package.
  */
  name: 'socat' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dest-unreach.org/socat' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'SOcket CAT: netcat on steroids' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dest-unreach.org/socat/package.yml' as const,
  homepageUrl: 'http://www.dest-unreach.org/socat/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install dest-unreach.org/socat' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dest-unreach.org/socat -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dest-unreach.org/socat' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'socat',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
    'gnu.org/readline^8.2',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.8.1.1',
    '1.8.1.0',
    '1.8.0.3',
    '1.8.0.2',
    '1.8.0.1',
    '1.8.0.0',
  ] as const,
  aliases: [] as const,
}

export type DestunreachorgsocatPackage = typeof destunreachorgsocatPackage
