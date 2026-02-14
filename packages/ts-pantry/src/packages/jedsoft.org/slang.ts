/**
 * **s-lang** - Library for creating multi-platform software
 *
 * @domain `jedsoft.org/slang`
 * @programs `slsh`
 * @version `2.3.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jedsoft.org/slang`
 * @homepage https://www.jedsoft.org/slang/
 * @dependencies `libpng.org`, `linux:pcre.org` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jedsoftorgslang
 * console.log(pkg.name)        // "s-lang"
 * console.log(pkg.description) // "Library for creating multi-platform software"
 * console.log(pkg.programs)    // ["slsh"]
 * console.log(pkg.versions[0]) // "2.3.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jedsoft-org/slang.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jedsoftorgslangPackage = {
  /**
  * The display name of this package.
  */
  name: 's-lang' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'jedsoft.org/slang' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Library for creating multi-platform software' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jedsoft.org/slang/package.yml' as const,
  homepageUrl: 'https://www.jedsoft.org/slang/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install jedsoft.org/slang' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jedsoft.org/slang -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jedsoft.org/slang' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'slsh',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'libpng.org',
    'linux:pcre.org',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.3.3',
  ] as const,
  aliases: [] as const,
}

export type JedsoftorgslangPackage = typeof jedsoftorgslangPackage
