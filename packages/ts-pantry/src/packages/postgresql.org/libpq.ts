/**
 * **libpq** - pkgx package
 *
 * @domain `postgresql.org/libpq`
 * @version `18.0.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install postgresql.org/libpq`
 * @dependencies `kerberos.org`, `openssl.org^1.1`, `zlib.net^1`, ... (+1 more) (includes platform-specific dependencies)
 * @buildDependencies `unicode.org^71`, `linux:gnu.org/bison`, `linux:github.com/westes/flex` (includes platform-specific dependencies) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.postgresqlorglibpq
 * console.log(pkg.name)        // "libpq"
 * console.log(pkg.versions[0]) // "18.0.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/postgresql-org/libpq.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const postgresqlorglibpqPackage = {
  /**
  * The display name of this package.
  */
  name: 'libpq' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'postgresql.org/libpq' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/postgresql.org/libpq/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install postgresql.org/libpq' as const,
  pantryInstallCommand: 'pantry install postgresql.org/libpq' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'kerberos.org',
    'openssl.org^1.1',
    'zlib.net^1',
    'linux:gnu.org/readline',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'unicode.org^71',
    'linux:gnu.org/bison',
    'linux:github.com/westes/flex',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '18.0.0',
    '17.0.0',
    '16.1.0',
    '16.0.0',
    '15.2.0',
  ] as const,
  aliases: [] as const,
}

export type PostgresqlorglibpqPackage = typeof postgresqlorglibpqPackage
