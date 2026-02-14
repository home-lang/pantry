/**
 * **replibyte** - Seed your development database with real data ⚡️
 *
 * @domain `replibyte.com`
 * @programs `replibyte`
 * @version `0.10.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install replibyte.com`
 * @homepage https://www.replibyte.com
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.replibytecom
 * console.log(pkg.name)        // "replibyte"
 * console.log(pkg.description) // "Seed your development database with real data ⚡️"
 * console.log(pkg.programs)    // ["replibyte"]
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/replibyte-com.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install replibyte.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +replibyte.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install replibyte.com' as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.0',
  ] as const,
  aliases: [] as const,
}

export type ReplibytecomPackage = typeof replibytecomPackage
