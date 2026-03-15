/**
 * **rpm-sequoia** - pkgx package
 *
 * @domain `rpm.org/rpm-sequoia`
 * @version `1.10.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install rpm.org/rpm-sequoia`
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rpmorgrpmsequoia
 * console.log(pkg.name)        // "rpm-sequoia"
 * console.log(pkg.versions[0]) // "1.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rpm-org/rpm-sequoia.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rpmorgrpmsequoiaPackage = {
  /**
  * The display name of this package.
  */
  name: 'rpm-sequoia' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rpm.org/rpm-sequoia' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rpm.org/rpm-sequoia/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install rpm.org/rpm-sequoia' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rpm.org/rpm-sequoia -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install rpm.org/rpm-sequoia' as const,
  programs: [] as const,
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
    '1.10.1',
  ] as const,
  aliases: [] as const,
}

export type RpmorgrpmsequoiaPackage = typeof rpmorgrpmsequoiaPackage
