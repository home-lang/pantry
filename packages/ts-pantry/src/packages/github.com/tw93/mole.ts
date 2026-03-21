/**
 * **mole** - Deep clean and optimize your Mac
 *
 * @domain `github.com/tw93/mole`
 * @programs `mole`, `mo`
 * @version `1.31.0` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/tw93/mole`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.githubcomtw93mole
 * console.log(pkg.name)        // "mole"
 * console.log(pkg.description) // "Deep clean and optimize your Mac"
 * console.log(pkg.programs)    // ["mole", "mo"]
 * console.log(pkg.versions[0]) // "1.31.0" (latest)
 * ```
 *
 * @see https://github.com/tw93/Mole
 */
export const githubcomtw93molePackage = {
  name: 'mole' as const,
  domain: 'github.com/tw93/mole' as const,
  description: 'Deep clean and optimize your Mac' as const,
  packageYmlUrl: 'https://github.com/tw93/Mole' as const,
  homepageUrl: 'https://github.com/tw93/Mole' as const,
  githubUrl: 'https://github.com/tw93/Mole' as const,
  installCommand: 'pantry install github.com/tw93/mole' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/tw93/mole -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install github.com/tw93/mole' as const,
  programs: [
    'mole',
    'mo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [
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
    '1.15.7',
    '1.15.6',
  ] as const,
  aliases: [] as const,
}

export type Githubcomtw93molePackage = typeof githubcomtw93molePackage
