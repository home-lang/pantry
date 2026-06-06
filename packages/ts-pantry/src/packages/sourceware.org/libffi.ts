/**
 * **libffi** - A portable foreign-function interface library.
 *
 * @domain `sourceware.org/libffi`
 * @version `3.5.2` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sourceware.org/libffi`
 * @homepage http://sourceware.org/libffi
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.sourcewareorglibffi
 * console.log(pkg.name)        // "libffi"
 * console.log(pkg.description) // "A portable foreign-function interface library."
 * console.log(pkg.versions[0]) // "3.5.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sourceware-org/libffi.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const sourcewareorglibffiPackage = {
  /**
  * The display name of this package.
  */
  name: 'libffi' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sourceware.org/libffi' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A portable foreign-function interface library.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sourceware.org/libffi/package.yml' as const,
  homepageUrl: 'http://sourceware.org/libffi' as const,
  githubUrl: 'https://github.com/libffi/libffi' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sourceware.org/libffi' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sourceware.org/libffi -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install sourceware.org/libffi' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.5.2',
    '3.5.1',
    '3.5.1-dev',
    '3.5.0',
    '3.5.0-rc1',
    '3.5.0-rc0',
    '3.4.8',
    '3.4.7',
    '3.4.6',
    '3.4.5',
    '3.4.4',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.4.0-rc2',
    '3.4-rc1',
    '3.3',
    '3.3-rc2',
    '3.3-rc1',
    '3.3-rc0',
    '3.2.1',
    '3.2',
    '3.1',
    '3.0.13',
    '3.0.12',
    '3.0.11',
    '3.0.10',
    '3.0.9',
  ] as const,
  aliases: [] as const,
}

export type SourcewareorglibffiPackage = typeof sourcewareorglibffiPackage
