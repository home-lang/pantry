/**
 * **elementsproject** - Open Source implementation of advanced blockchain features extending the Bitcoin protocol
 *
 * @domain `elementsproject.org`
 * @programs `bench_bitcoin`, `elements-cli`, `elements-tx`, `elements-util`, `elements-wallet`, ... (+2 more)
 * @version `23.3.1` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install elementsproject.org`
 * @dependencies `boost.org^1.64`, `libevent.org`, `oracle.com/berkeley-db`
 * @buildDependencies `gnu.org/automake`, `gnu.org/autoconf`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.elementsprojectorg
 * console.log(pkg.name)        // "elementsproject"
 * console.log(pkg.description) // "Open Source implementation of advanced blockcha..."
 * console.log(pkg.programs)    // ["bench_bitcoin", "elements-cli", ...]
 * console.log(pkg.versions[0]) // "23.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/elementsproject-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const elementsprojectorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'elementsproject' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'elementsproject.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Open Source implementation of advanced blockchain features extending the Bitcoin protocol' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/elementsproject.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ElementsProject/elements' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install elementsproject.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +elementsproject.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install elementsproject.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bench_bitcoin',
    'elements-cli',
    'elements-tx',
    'elements-util',
    'elements-wallet',
    'elementsd',
    'test_bitcoin',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'boost.org^1.64',
    'libevent.org',
    'oracle.com/berkeley-db',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/automake',
    'gnu.org/autoconf',
    'gnu.org/libtool',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '23.3.1',
    '23.3.0',
    '23.2.7',
    '23.2.6',
    '23.2.5',
    '23.2.4',
    '23.2.3',
    '23.2.2',
    '23.2.1',
    '22.1.1',
  ] as const,
  aliases: [] as const,
}

export type ElementsprojectorgPackage = typeof elementsprojectorgPackage
