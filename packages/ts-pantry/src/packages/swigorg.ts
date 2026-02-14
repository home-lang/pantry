/**
 * **swig** - SWIG is a software development tool that connects programs written in C and C++ with a variety of high-level programming languages.
 *
 * @domain `swig.org`
 * @programs `swig`, `ccache-swig`
 * @version `4.4.1` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install swig.org`
 * @homepage https://www.swig.org/
 * @dependencies `pcre.org/v2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.swigorg
 * console.log(pkg.name)        // "swig"
 * console.log(pkg.description) // "SWIG is a software development tool that connec..."
 * console.log(pkg.programs)    // ["swig", "ccache-swig"]
 * console.log(pkg.versions[0]) // "4.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/swig-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const swigorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'swig' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'swig.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'SWIG is a software development tool that connects programs written in C and C++ with a variety of high-level programming languages.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/swig.org/package.yml' as const,
  homepageUrl: 'https://www.swig.org/' as const,
  githubUrl: 'https://github.com/swig/swig' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install swig.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +swig.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install swig.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'swig',
    'ccache-swig',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pcre.org/v2',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '4.4.1',
    '4.4.0',
    '4.3.1',
    '4.3.0',
    '4.2.1',
    '4.2.0',
    '4.1.1',
  ] as const,
  aliases: [] as const,
}

export type SwigorgPackage = typeof swigorgPackage
