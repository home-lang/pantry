/**
 * **mole** - Deep clean and optimize your Mac
 *
 * @domain `github.com/tw93/mole`
 * @programs `mole`, `mo`
 * @version `1.41.0` (24 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/tw93/mole`
 * @homepage https://github.com/tw93/Mole
 * @buildDependencies none
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomtw93mole
 * console.log(pkg.name)        // "mole"
 * console.log(pkg.description) // "Deep clean and optimize your Mac"
 * console.log(pkg.programs)    // ["mole", "mo"]
 * console.log(pkg.versions[0]) // "1.41.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/github-com/tw93/mole.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const molePackage = {
  /**
  * The display name of this package.
  */
  name: 'mole' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/tw93/mole' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Deep clean and optimize your Mac' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/tw93/mole/package.yml' as const,
  homepageUrl: 'https://github.com/tw93/Mole' as const,
  githubUrl: 'https://github.com/tw93/mole' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install github.com/tw93/mole' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/tw93/mole -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/tw93/mole' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mole',
    'mo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.42.0',
    '1.41.0',
    '1.40.0',
    '1.39.1',
    '1.39.0',
    '1.38.1',
    '1.38.0',
    '1.37.0',
    '1.36.3',
    '1.36.2',
    '1.36.0',
    '1.35.0',
    '1.34.0',
    '1.33.0',
    '1.32.0',
    '1.31.0',
    '1.30.0',
    '1.29.0',
    '1.28.1',
    '1.28.0',
    '1.27.0',
    '1.26.0',
    '1.25.0',
    '1.24.0',
    '1.23.2',
    '1.22.1',
    '1.21.0',
    '1.20.0',
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.16.1',
    '1.15.8',
    '1.14.7',
    '1.13.13',
    '1.12.25',
    '1.11.34',
    '1.10.17',
    '1.9.20',
    '1.8.3',
    '1.7.17',
    '1.6.4',
    '1.4.1',
    '1.2.0',
  ] as const,
  aliases: [] as const,
}

export type MolePackage = typeof molePackage
