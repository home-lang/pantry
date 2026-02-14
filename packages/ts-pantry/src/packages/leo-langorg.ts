/**
 * **leo** - 🦁 The Leo Programming Language. A Programming Language for Formally Verified, Zero-Knowledge Applications
 *
 * @domain `leo-lang.org`
 * @programs `leo`
 * @version `3.4.0` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install leo-lang.org`
 * @homepage https://leo-lang.org/
 * @dependencies `openssl.org^1.1`, `curl.se^8.4`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.leolangorg
 * console.log(pkg.name)        // "leo"
 * console.log(pkg.description) // "🦁 The Leo Programming Language. A Programming ..."
 * console.log(pkg.programs)    // ["leo"]
 * console.log(pkg.versions[0]) // "3.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/leo-lang-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const leolangorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'leo' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'leo-lang.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '🦁 The Leo Programming Language. A Programming Language for Formally Verified, Zero-Knowledge Applications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/leo-lang.org/package.yml' as const,
  homepageUrl: 'https://leo-lang.org/' as const,
  githubUrl: 'https://github.com/AleoHQ/leo' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install leo-lang.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +leo-lang.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install leo-lang.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'leo',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
    'curl.se^8.4',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.0',
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.1',
    '2.4.0',
    '2.3.1',
    '2.3.0',
    '2.2.0',
    '2.1.0',
    '2.0.0',
    '1.12.0',
    '1.11.0',
    '1.10.0',
  ] as const,
  aliases: [] as const,
}

export type LeolangorgPackage = typeof leolangorgPackage
