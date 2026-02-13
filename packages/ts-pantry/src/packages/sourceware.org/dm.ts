/**
 * **device-mapper** - pkgx package
 *
 * @domain `sourceware.org/dm`
 * @version `2.3.38` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sourceware.org/dm`
 * @dependencies `pagure.io/libaio^0.3`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sourcewareorgdm
 * console.log(pkg.name)        // "device-mapper"
 * console.log(pkg.versions[0]) // "2.3.38" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sourceware-org/dm.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sourcewareorgdmPackage = {
  /**
   * The display name of this package.
   */
  name: 'device-mapper' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sourceware.org/dm' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceware.org/dm/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sourceware.org/dm' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceware.org/dm -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sourceware.org/dm' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pagure.io/libaio^0.3',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.38',
    '2.3.37',
    '2.3.36',
    '2.3.35',
    '2.3.34',
    '2.3.33',
    '2.3.32',
    '2.3.31',
    '2.3.30',
    '2.3.29',
    '2.3.28',
    '2.3.27',
    '2.3.26',
    '2.3.25',
    '2.3.24',
    '2.3.22',
  ] as const,
  aliases: [] as const,
}

export type SourcewareorgdmPackage = typeof sourcewareorgdmPackage
