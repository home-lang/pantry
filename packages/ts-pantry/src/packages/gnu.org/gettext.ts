/**
 * **gettext** - GNU internationalization (i18n) and localization (l10n) library
 *
 * @domain `gnu.org/gettext`
 * @programs `autopoint`, `envsubst`, `gettext`, `gettext.sh`, `gettextize`, ... (+17 more)
 * @version `1.0.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install gnu.org/gettext`
 * @homepage https://www.gnu.org/software/gettext/
 * @dependencies `gnome.org/libxml2~2.13 # 2.14 changes the API`, `tukaani.org/xz^5 # autopoint needs this to unpack archives`
 * @buildDependencies `perl.org@~5.42`, `darwin:gnu.org/libiconv` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.gnuorggettext
 * console.log(pkg.name)        // "gettext"
 * console.log(pkg.description) // "GNU internationalization (i18n) and localizatio..."
 * console.log(pkg.programs)    // ["autopoint", "envsubst", ...]
 * console.log(pkg.versions[0]) // "1.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/gnu-org/gettext.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const gnuorggettextPackage = {
  /**
  * The display name of this package.
  */
  name: 'gettext' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/gettext' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'GNU internationalization (i18n) and localization (l10n) library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gettext/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/gettext/' as const,
  githubUrl: 'https://github.com/autotools-mirror/gettext' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install gnu.org/gettext' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/gettext -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install gnu.org/gettext' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'autopoint',
    'envsubst',
    'gettext',
    'gettext.sh',
    'gettextize',
    'msgattrib',
    'msgcat',
    'msgcmp',
    'msgcomm',
    'msgconv',
    'msgen',
    'msgexec',
    'msgfilter',
    'msgfmt',
    'msggrep',
    'msginit',
    'msgmerge',
    'msgunfmt',
    'msguniq',
    'ngettext',
    'recode-sr-latin',
    'xgettext',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/libxml2~2.13 # 2.14 changes the API',
    'tukaani.org/xz^5 # autopoint needs this to unpack archives',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'perl.org@~5.42',
    'darwin:gnu.org/libiconv',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.0',
    '0.26',
    '0.25.1',
    '0.25',
    '0.24.2',
    '0.24.1',
    '0.24',
    '0.23.2',
    '0.23.1',
    '0.23',
    '0.22.5',
    '0.22.4',
    '0.22.3',
    '0.22.2',
    '0.22.1',
    '0.22',
    '0.22.0',
    '0.21.1',
    '0.21',
    '0.20.2',
    '0.20.1',
    '0.20',
    '0.19.8.1',
    '0.19.8',
    '0.19.7',
    '0.19.6',
    '0.19.5.1',
    '0.19.5',
    '0.19.4',
    '0.19.3',
    '0.19.2.1',
    '0.19.2',
    '0.19.1',
    '0.19',
    '0.18.3.2',
    '0.18.3.1',
    '0.18.3',
    '0.18.2.1',
    '0.18.2',
    '0.18.1.1',
    '0.18.1',
    '0.18',
    '0.17',
    '0.16.1',
    '0.16',
    '0.15',
    '0.14.6',
    '0.14.5',
    '0.14.4',
    '0.14.3',
    '0.14.2',
  ] as const,
  aliases: [] as const,
}

export type GnuorggettextPackage = typeof gnuorggettextPackage
