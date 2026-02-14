/**
 * **graphene** - A thin layer of graphic data types
 *
 * @domain `ebassi.github.io/graphene`
 * @version `1.10.8` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ebassi.github.io/graphene`
 * @homepage http://ebassi.github.io/graphene
 * @dependencies `gnome.org/glib`
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ebassigithubiographene
 * console.log(pkg.name)        // "graphene"
 * console.log(pkg.description) // "A thin layer of graphic data types"
 * console.log(pkg.versions[0]) // "1.10.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ebassi-github-io/graphene.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ebassigithubiographenePackage = {
  /**
  * The display name of this package.
  */
  name: 'graphene' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ebassi.github.io/graphene' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A thin layer of graphic data types' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ebassi.github.io/graphene/package.yml' as const,
  homepageUrl: 'http://ebassi.github.io/graphene' as const,
  githubUrl: 'https://github.com/ebassi/graphene' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ebassi.github.io/graphene' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ebassi.github.io/graphene -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ebassi.github.io/graphene' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnome.org/glib',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.10.8',
  ] as const,
  aliases: [] as const,
}

export type EbassigithubiographenePackage = typeof ebassigithubiographenePackage
