/**
 * **libcap-ng** - Libcap-ng is a library for Linux that makes using posix capabilities easy.
 *
 * @domain `people.redhat.com/sgrubb/libcap-ng`
 * @programs `captest`, `filecap`, `netcap`, `pscap`
 * @version `0.8.5` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install people.redhat.com/sgrubb/libcap-ng`
 * @homepage https://people.redhat.com/sgrubb/libcap-ng/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.peopleredhatcomsgrubblibcapng
 * console.log(pkg.name)        // "libcap-ng"
 * console.log(pkg.description) // "Libcap-ng is a library for Linux that makes usi..."
 * console.log(pkg.programs)    // ["captest", "filecap", ...]
 * console.log(pkg.versions[0]) // "0.8.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/people-redhat-com/sgrubb/libcap-ng.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const peopleredhatcomsgrubblibcapngPackage = {
  /**
  * The display name of this package.
  */
  name: 'libcap-ng' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'people.redhat.com/sgrubb/libcap-ng' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Libcap-ng is a library for Linux that makes using posix capabilities easy.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/people.redhat.com/sgrubb/libcap-ng/package.yml' as const,
  homepageUrl: 'https://people.redhat.com/sgrubb/libcap-ng/' as const,
  githubUrl: 'https://github.com/stevegrubb/libcap-ng' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install people.redhat.com/sgrubb/libcap-ng' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +people.redhat.com/sgrubb/libcap-ng -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install people.redhat.com/sgrubb/libcap-ng' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'captest',
    'filecap',
    'netcap',
    'pscap',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.8.5',
    '0.8.4',
    '0.8.3',
  ] as const,
  aliases: [] as const,
}

export type PeopleredhatcomsgrubblibcapngPackage = typeof peopleredhatcomsgrubblibcapngPackage
