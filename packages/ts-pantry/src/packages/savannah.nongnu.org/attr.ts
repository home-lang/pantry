/**
 * **attr** - Manipulate filesystem extended attributes
 *
 * @domain `savannah.nongnu.org/attr`
 * @programs `attr`, `getfattr`, `setfattr`
 * @version `2.5.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install savannah.nongnu.org/attr`
 * @homepage https://savannah.nongnu.org/projects/attr
 * @buildDependencies `gnu.org/gettext` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.savannahnongnuorgattr
 * console.log(pkg.name)        // "attr"
 * console.log(pkg.description) // "Manipulate filesystem extended attributes"
 * console.log(pkg.programs)    // ["attr", "getfattr", ...]
 * console.log(pkg.versions[0]) // "2.5.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/savannah-nongnu-org/attr.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const savannahnongnuorgattrPackage = {
  /**
  * The display name of this package.
  */
  name: 'attr' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'savannah.nongnu.org/attr' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Manipulate filesystem extended attributes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/savannah.nongnu.org/attr/package.yml' as const,
  homepageUrl: 'https://savannah.nongnu.org/projects/attr' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install savannah.nongnu.org/attr' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +savannah.nongnu.org/attr -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install savannah.nongnu.org/attr' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'attr',
    'getfattr',
    'setfattr',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/gettext',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.5.2',
    '2.5.1',
  ] as const,
  aliases: [] as const,
}

export type SavannahnongnuorgattrPackage = typeof savannahnongnuorgattrPackage
