/**
 * **libSM** - pkgx package
 *
 * @domain `x.org/libSM`
 * @version `1.2.6` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/libSM`
 * @dependencies `x.org/ice`
 * @buildDependencies `x.org/xtrans` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorglibsm
 * console.log(pkg.name)        // "libSM"
 * console.log(pkg.versions[0]) // "1.2.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/libSM.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorglibsmPackage = {
  /**
  * The display name of this package.
  */
  name: 'libSM' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/libSM' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/libSM/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/libSM' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/libSM -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/libSM' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/ice',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'x.org/xtrans',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.2.6',
    '1.2.5',
    '1.2.4',
  ] as const,
  aliases: [] as const,
}

export type XorglibsmPackage = typeof xorglibsmPackage
