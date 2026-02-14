/**
 * **mandoc.bsd.lv** - UNIX manpage compiler toolset
 *
 * @domain `mandoc.bsd.lv`
 * @programs `bsdapropos`, `bsdman`, `bsdsoelim`, `bsdwhatis`, `demandoc`, ... (+1 more)
 * @version `1.14.6` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mandoc.bsd.lv`
 * @homepage https://mandoc.bsd.lv/
 * @dependencies `zlib.net`
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mandocbsdlv
 * console.log(pkg.name)        // "mandoc.bsd.lv"
 * console.log(pkg.description) // "UNIX manpage compiler toolset"
 * console.log(pkg.programs)    // ["bsdapropos", "bsdman", ...]
 * console.log(pkg.versions[0]) // "1.14.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mandoc-bsd-lv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mandocbsdlvPackage = {
  /**
  * The display name of this package.
  */
  name: 'mandoc.bsd.lv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'mandoc.bsd.lv' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'UNIX manpage compiler toolset' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mandoc.bsd.lv/package.yml' as const,
  homepageUrl: 'https://mandoc.bsd.lv/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install mandoc.bsd.lv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mandoc.bsd.lv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mandoc.bsd.lv' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bsdapropos',
    'bsdman',
    'bsdsoelim',
    'bsdwhatis',
    'demandoc',
    'mandoc',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.14.6',
  ] as const,
  aliases: [] as const,
}

export type MandocbsdlvPackage = typeof mandocbsdlvPackage
