/**
 * **groff** - GNU troff text-formatting system
 *
 * @domain `gnu.org/groff`
 * @programs `addftinfo`, `afmtodit`, `chem`, `eqn`, `eqn2graph`, ... (+34 more)
 * @version `1.24.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/groff`
 * @homepage https://www.gnu.org/software/groff/
 * @dependencies `ghostscript.com`, `netpbm.sourceforge.net`, `github.com/rrthomas/psutils`, ... (+3 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `linux:gnu.org/gcc`, `gnu.org/make`, `gnu.org/bison`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggroff
 * console.log(pkg.name)        // "groff"
 * console.log(pkg.description) // "GNU troff text-formatting system"
 * console.log(pkg.programs)    // ["addftinfo", "afmtodit", ...]
 * console.log(pkg.versions[0]) // "1.24.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/groff.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorggroffPackage = {
  /**
  * The display name of this package.
  */
  name: 'groff' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/groff' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'GNU troff text-formatting system' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/groff/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/groff/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/groff' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/groff -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/groff' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'addftinfo',
    'afmtodit',
    'chem',
    'eqn',
    'eqn2graph',
    'gdiffmk',
    'glilypond',
    'gperl',
    'gpinyin',
    'grap2graph',
    'grn',
    'grodvi',
    'groff',
    'grog',
    'grolbp',
    'grolj4',
    'gropdf',
    'grops',
    'grotty',
    'hpftodit',
    'indxbib',
    'lkbib',
    'lookbib',
    'mmroff',
    'neqn',
    'nroff',
    'pdfmom',
    'pdfroff',
    'pfbtops',
    'pic',
    'pic2graph',
    'post-grohtml',
    'preconv',
    'pre-grohtml',
    'refer',
    'soelim',
    'tbl',
    'tfmtodit',
    'troff',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'ghostscript.com',
    'netpbm.sourceforge.net',
    'github.com/rrthomas/psutils',
    'freedesktop.org/uchardet',
    'perl.org',
    'linux:gnome.org/glib',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc',
    'gnu.org/make',
    'gnu.org/bison',
    'gnu.org/texinfo',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.24.0',
    '1.23.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorggroffPackage = typeof gnuorggroffPackage
