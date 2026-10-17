/**
 * **tcl-lang** - Tool Command Language
 *
 * @domain `tcl-lang.org`
 * @programs `tclsh`, `wish`, `critcl`
 * @version `9.0.3` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install tcl-lang.org`
 * @homepage https://www.tcl-lang.org
 * @dependencies `zlib.net^1`, `linux:x.org/x11^1`, `linux:x.org/exts^1`, ... (+1 more) (includes platform-specific dependencies)
 * @buildDependencies `curl.se`, `freedesktop.org/pkg-config~0.29` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.tcllangorg
 * console.log(pkg.name)        // "tcl-lang"
 * console.log(pkg.description) // "Tool Command Language"
 * console.log(pkg.programs)    // ["tclsh", "wish", ...]
 * console.log(pkg.versions[0]) // "9.0.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/tcl-lang-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const tcllangorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'tcl-lang' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tcl-lang.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tool Command Language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tcl-lang.org/package.yml' as const,
  homepageUrl: 'https://www.tcl-lang.org' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install tcl-lang.org' as const,
  pantryInstallCommand: 'pantry install tcl-lang.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tclsh',
    'wish',
    'critcl',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'zlib.net^1',
    'linux:x.org/x11^1',
    'linux:x.org/exts^1',
    'linux:x.org/xft^2',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
    'freedesktop.org/pkg-config~0.29',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '9.0.3',
    '9.0.2',
    '9.0.1',
    '9.0.0',
    '8.6.17',
    '8.6.16',
    '8.6.15',
    '8.6.14',
    '8.6.13',
  ] as const,
  aliases: [] as const,
}

export type TcllangorgPackage = typeof tcllangorgPackage
