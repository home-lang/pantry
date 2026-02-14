/**
 * **libelf** - pkgx package
 *
 * @domain `fossies.org/libelf`
 * @version `0.8.13` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fossies.org/libelf`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fossiesorglibelf
 * console.log(pkg.name)        // "libelf"
 * console.log(pkg.versions[0]) // "0.8.13" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fossies-org/libelf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fossiesorglibelfPackage = {
  /**
  * The display name of this package.
  */
  name: 'libelf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'fossies.org/libelf' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fossies.org/libelf/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install fossies.org/libelf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fossies.org/libelf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fossies.org/libelf' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.8.13',
  ] as const,
  aliases: [] as const,
}

export type FossiesorglibelfPackage = typeof fossiesorglibelfPackage
