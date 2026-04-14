/**
 * **replibyte** - Seed your development database with real data ⚡️
 *
 * @domain `replibyte.com`
 * @programs `replibyte`
 * @version `0.10.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install replibyte.com`
 * @homepage https://www.replibyte.com
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.replibytecom
 * console.log(pkg.name)        // "replibyte"
 * console.log(pkg.description) // "Seed your development database with real data ⚡️"
 * console.log(pkg.programs)    // ["replibyte"]
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/replibyte-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const replibytecomPackage = {
  /**
  * The display name of this package.
  */
  name: 'replibyte' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'replibyte.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Seed your development database with real data ⚡️' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/replibyte.com/package.yml' as const,
  homepageUrl: 'https://www.replibyte.com' as const,
  githubUrl: 'https://github.com/Qovery/Replibyte' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install replibyte.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +replibyte.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install replibyte.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'replibyte',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.0',
    '0.9.7',
    '0.9.6',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.6',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.0',
    '0.4.6',
    '0.4.5',
    '0.4.4',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.1',
    '0.3.0',
    '0.2.1',
    '0.2.0',
    '0.1.8',
    '0.1.7',
    '0.1.6',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.0.13',
  ] as const,
  aliases: [] as const,
}

export type ReplibytecomPackage = typeof replibytecomPackage
