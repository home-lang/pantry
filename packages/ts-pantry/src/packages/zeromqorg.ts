/**
 * **zeromq** - ZeroMQ core engine in C++, implements ZMTP/3.1
 *
 * @domain `zeromq.org`
 * @version `4.3.5` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install zeromq.org`
 * @homepage https://www.zeromq.org
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.zeromqorg
 * console.log(pkg.name)        // "zeromq"
 * console.log(pkg.description) // "ZeroMQ core engine in C++, implements ZMTP/3.1"
 * console.log(pkg.versions[0]) // "4.3.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/zeromq-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zeromqorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'zeromq' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'zeromq.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'ZeroMQ core engine in C++, implements ZMTP/3.1' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/zeromq.org/package.yml' as const,
  homepageUrl: 'https://www.zeromq.org' as const,
  githubUrl: 'https://github.com/zeromq/libzmq' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install zeromq.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +zeromq.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install zeromq.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.3.5',
    '4.3.4',
  ] as const,
  aliases: [] as const,
}

export type ZeromqorgPackage = typeof zeromqorgPackage
