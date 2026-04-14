/**
 * **elementsproject** - Open Source implementation of advanced blockchain features extending the Bitcoin protocol
 *
 * @domain `elementsproject.org`
 * @programs `bench_bitcoin`, `elements-cli`, `elements-tx`, `elements-util`, `elements-wallet`, ... (+2 more)
 * @version `23.3.2` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install elementsproject.org`
 * @dependencies `boost.org^1.64`, `libevent.org`, `oracle.com/berkeley-db`
 * @buildDependencies `gnu.org/automake`, `gnu.org/autoconf`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.elementsprojectorg
 * console.log(pkg.name)        // "elementsproject"
 * console.log(pkg.description) // "Open Source implementation of advanced blockcha..."
 * console.log(pkg.programs)    // ["bench_bitcoin", "elements-cli", ...]
 * console.log(pkg.versions[0]) // "23.3.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/elementsproject-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install elementsproject.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +elementsproject.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install elementsproject.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '23.3.3',
    '23.3.2',
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
    '22.1',
    '22.0.2',
    '0.21.0.3',
    '0.21.0.2',
    '0.21.0.1',
    '0.21.0',
    '0.18.1.12',
    '0.18.1.11',
    '0.18.1.9',
    '0.18.1.8',
    '0.18.1.7',
    '0.18.1.6',
    '0.18.1.5',
    '0.18.1.4',
    '0.18.1.3',
    '0.18.1.2',
    '0.18.1.1',
    '0.17.0.3',
    '0.17.0.2',
    '0.17.0.1',
    '0.17.0',
  ] as const,
  aliases: [] as const,
}

export type ElementsprojectorgPackage = typeof elementsprojectorgPackage
