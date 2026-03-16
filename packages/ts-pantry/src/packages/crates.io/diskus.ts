/**
 * **diskus** - A minimal, fast alternative to 'du -sh'
 *
 * @domain `crates.io/diskus`
 * @programs `diskus`
 * @version `0.9.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install crates.io/diskus`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cratesiodiskus
 * console.log(pkg.name)        // "diskus"
 * console.log(pkg.description) // "A minimal, fast alternative to 'du -sh'"
 * console.log(pkg.programs)    // ["diskus"]
 * console.log(pkg.versions[0]) // "0.9.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/crates-io/diskus.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const cratesiodiskusPackage = {
  /**
  * The display name of this package.
  */
  name: 'diskus' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/diskus' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A minimal, fast alternative to \'du -sh\'' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/diskus/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sharkdp/diskus' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install crates.io/diskus' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/diskus -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install crates.io/diskus' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'diskus',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.0',
    '0.8.0',
    '0.7.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiodiskusPackage = typeof cratesiodiskusPackage
