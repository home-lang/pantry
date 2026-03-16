/**
 * **tre** - Tree command, improved.
 *
 * @domain `github.com/dduan/tre`
 * @programs `tre`
 * @version `0.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/dduan/tre`
 * @dependencies `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomdduantre
 * console.log(pkg.name)        // "tre"
 * console.log(pkg.description) // "Tree command, improved."
 * console.log(pkg.programs)    // ["tre"]
 * console.log(pkg.versions[0]) // "0.4.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/dduan/tre.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const trePackage = {
  /**
  * The display name of this package.
  */
  name: 'tre' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/dduan/tre' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tree command, improved.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/dduan/tre/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/dduan/tre' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/dduan/tre' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/dduan/tre -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/dduan/tre' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tre',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.0',
  ] as const,
  aliases: [] as const,
}

export type TrePackage = typeof trePackage
