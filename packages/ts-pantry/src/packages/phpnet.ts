/**
 * **php** - General-purpose scripting language
 *
 * @domain `php.net`
 * @programs `phar`, `php`, `php-cgi`, `php-config`, `phpdbg`, ... (+2 more)
 * @version `8.5.11` (149 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install php.net`
 * @homepage https://www.php.net/
 * @dependencies `gnu.org/bison^3`, `re2c.org^3`, `apache.org/apr^1`, ... (+29 more) (includes platform-specific dependencies)
 * @buildDependencies `freetype.org`, `gnu.org/libtool`, `darwin:tukaani.org/xz` (includes platform-specific dependencies) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.phpnet
 * console.log(pkg.name)        // "php"
 * console.log(pkg.description) // "General-purpose scripting language"
 * console.log(pkg.programs)    // ["phar", "php", ...]
 * console.log(pkg.versions[0]) // "8.5.11" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/php-net.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const phpPackage = {
  /**
  * The display name of this package.
  */
  name: 'php' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'php.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'General-purpose scripting language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/php.net/package.yml' as const,
  homepageUrl: 'https://www.php.net/' as const,
  githubUrl: 'https://github.com/php/php-src' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install php.net' as const,
  pantryInstallCommand: 'pantry install php.net' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'phar',
    'php',
    'php-cgi',
    'php-config',
    'phpdbg',
    'phpize',
    'php-fpm',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'gnu.org/bison^3',
    're2c.org^3',
    'apache.org/apr^1',
    'apache.org/apr-util^1',
    'bcrypt.sourceforge.net^1',
    'gnu.org/autoconf^2',
    'curl.se^8',
    'nghttp2.org',
    'gnu.org/gettext^0',
    'gnu.org/gmp^6',
    'libsodium.org<1.0.19',
    'libzip.org^1.9',
    'github.com/kkos/oniguruma^6',
    'openssl.org^3',
    'pcre.org/v2>=10.30',
    'sqlite.org^3',
    'postgresql.org^17',
    'unicode.org^71',
    'gnu.org/libiconv^1',
    'kerberos.org^1',
    'gnome.org/libxml2',
    'thrysoee.dk/editline^3',
    'sourceware.org/libffi>=3.4.7',
    'gnome.org/libxslt>=1.1.0<1.1.43',
    'libpng.org^1',
    'google.com/webp^1',
    'ijg.org^9',
    'gnu.org/sed^4',
    'openldap.org^2',
    'gnu.org/gcc/libstdcxx^14',
    'darwin:sourceware.org/bzip2^1',
    'darwin:zlib.net^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'freetype.org',
    'gnu.org/libtool',
    'darwin:tukaani.org/xz',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '8.5.11',
    '8.5.10',
    '8.5.9',
    '8.5.8',
    '8.5.7',
    '8.5.7RC2',
    '8.5.7RC1',
    '8.5.6',
    '8.5.6RC3',
    '8.5.6RC2',
    '8.5.6RC1',
    '8.5.5',
    '8.5.5RC1',
    '8.5.4',
    '8.5.4RC1',
    '8.5.3',
    '8.5.3RC1',
    '8.5.2',
    '8.5.2RC1',
    '8.5.1',
    '8.5.1RC2',
    '8.5.1RC1',
    '8.5.0',
    '8.5.0beta3',
    '8.5.0beta2',
    '8.5.0beta1',
    '8.5.0alpha4',
    '8.5.0alpha3',
    '8.5.0alpha2',
    '8.5.0alpha1',
    '8.5.0RC5',
    '8.5.0RC4',
    '8.5.0RC3',
    '8.5.0RC2',
    '8.5.0RC1',
    '8.4.26',
    '8.4.25',
    '8.4.24',
    '8.4.23',
    '8.4.22',
    '8.4.22RC1',
    '8.4.21',
    '8.4.21RC1',
    '8.4.20',
    '8.4.20RC1',
    '8.4.19',
    '8.4.19RC1',
    '8.4.18',
    '8.4.18RC1',
    '8.4.17',
    '8.4.17RC1',
    '8.4.16',
    '8.4.16RC1',
    '8.4.15',
    '8.4.15RC1',
    '8.4.14',
    '8.4.14RC1',
    '8.4.13',
    '8.4.12',
    '8.4.11',
    '8.4.10',
    '8.4.9',
    '8.4.8',
    '8.4.7',
    '8.4.6',
    '8.4.5',
    '8.4.4',
    '8.4.3',
    '8.4.2',
    '8.4.1',
    '8.4.0',
    '8.3.31',
    '8.3.30',
    '8.3.29',
    '8.3.28',
    '8.3.27',
    '8.3.26',
    '8.3.25',
    '8.3.24',
    '8.3.23',
    '8.3.22',
    '8.3.21',
    '8.3.20',
    '8.3.19',
    '8.3.18',
    '8.3.17',
    '8.3.16',
    '8.3.15',
    '8.3.14',
    '8.3.13',
    '8.3.12',
    '8.3.11',
    '8.3.10',
    '8.3.9',
    '8.3.8',
    '8.3.7',
    '8.3.6',
    '8.3.5',
    '8.3.4',
    '8.3.3',
    '8.3.2',
    '8.3.1',
    '8.3.0',
    '8.2.31',
    '8.2.30',
    '8.2.29',
    '8.2.28',
    '8.2.27',
    '8.2.26',
    '8.2.25',
    '8.2.24',
    '8.2.23',
    '8.2.22',
    '8.2.21',
    '8.2.20',
    '8.2.19',
    '8.2.18',
    '8.2.17',
    '8.2.16',
    '8.2.15',
    '8.2.14',
    '8.2.13',
    '8.2.12',
    '8.2.11',
    '8.2.10',
    '8.2.9',
    '8.2.8',
    '8.2.7',
    '8.2.6',
    '8.2.5',
    '8.1.34',
    '8.1.33',
    '8.1.32',
    '8.1.31',
    '8.1.30',
    '8.1.29',
    '8.1.28',
    '8.1.27',
    '8.1.26',
    '8.1.25',
    '8.1.24',
    '8.1.23',
    '8.1.22',
    '8.1.21',
    '8.1.20',
    '8.1.18',
    '8.0.30',
    '8.0.28',
    '7.4.33',
  ] as const,
  aliases: [] as const,
}

export type PhpPackage = typeof phpPackage
