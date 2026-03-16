/**
 * **sig** - Interactive grep (for streaming)
 *
 * @domain `crates.io/sigrs`
 * @programs `sig`
 * @version `0.3.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install crates.io/sigrs`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cratesiosigrs
 * console.log(pkg.name)        // "sig"
 * console.log(pkg.description) // "Interactive grep (for streaming)"
 * console.log(pkg.programs)    // ["sig"]
 * console.log(pkg.versions[0]) // "0.3.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/crates-io/sigrs.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const cratesiosigrsPackage = {
  /**
  * The display name of this package.
  */
  name: 'sig' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/sigrs' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Interactive grep (for streaming)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/sigrs/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/ynqa/sig' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install crates.io/sigrs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/sigrs -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install crates.io/sigrs' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sig',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.0',
    '0.2.1',
    '0.2.0',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiosigrsPackage = typeof cratesiosigrsPackage
