/**
 * **bytebase** - World's most advanced database DevSecOps solution for Developer, Security, DBA and Platform Engineering teams. The GitHub/GitLab for database DevSecOps.
 *
 * @domain `bytebase.com`
 * @programs `bytebase`
 * @version `3.14.0` (47 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install bytebase.com`
 * @homepage https://www.bytebase.com
 * @dependencies `nodejs.org~24.1 # 24.4 has oom errors`
 * @buildDependencies `go.dev@~1.24.2`, `pnpm.io`, `linux:kerberos.org@1`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.bytebasecom
 * console.log(pkg.name)        // "bytebase"
 * console.log(pkg.description) // "World's most advanced database DevSecOps soluti..."
 * console.log(pkg.programs)    // ["bytebase"]
 * console.log(pkg.versions[0]) // "3.14.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/bytebase-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const bytebasecomPackage = {
  /**
   * The display name of this package.
   */
  name: 'bytebase' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'bytebase.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'World\'s most advanced database DevSecOps solution for Developer, Security, DBA and Platform Engineering teams. The GitHub/GitLab for database DevSecOps.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/bytebase.com/package.yml' as const,
  homepageUrl: 'https://www.bytebase.com' as const,
  githubUrl: 'https://github.com/bytebase/bytebase' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install bytebase.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bytebase.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install bytebase.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bytebase',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org~24.1 # 24.4 has oom errors',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev@~1.24.2',
    'pnpm.io',
    'linux:kerberos.org@1',
    'linux:gnu.org/gcc',
    'linux:python.org@~3.10',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.14.0',
    '3.13.1',
    '3.13.0',
    '3.12.2',
    '3.12.1',
    '3.12.0',
    '3.11.1',
    '3.11.0',
    '3.10.1',
    '3.10.0',
    '3.9.2',
    '3.9.1',
    '3.9.0',
    '3.8.1',
    '3.8.0',
    '3.7.1',
    '3.7.0',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.1',
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.0',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.1',
    '3.0.0',
    '2.23.1',
    '2.23.0',
    '2.22.3',
    '2.22.2',
    '2.22.1',
    '2.22.0',
    '2.21.0',
    '2.20.0',
    '2.19.0',
    '2.18.0',
    '2.17.0',
    '2.16.0',
    '2.15.0',
    '2.14.1',
  ] as const,
  aliases: [] as const,
}

export type BytebasecomPackage = typeof bytebasecomPackage
