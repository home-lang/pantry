/**
 * **protocol** - pkgx package
 *
 * @domain `x.org/protocol`
 * @version `2025.1.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install x.org/protocol`
 * @dependencies `x.org/util-macros`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.xorgprotocol
 * console.log(pkg.name)        // "protocol"
 * console.log(pkg.versions[0]) // "2025.1.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/x-org/protocol.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const xorgprotocolPackage = {
  /**
  * The display name of this package.
  */
  name: 'protocol' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/protocol' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/protocol/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install x.org/protocol' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/protocol -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install x.org/protocol' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/util-macros',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2025.1.0',
    '2024.1.0',
    '2023.2.0',
    '2023.1.0',
    '2022.2.0',
  ] as const,
  aliases: [] as const,
}

export type XorgprotocolPackage = typeof xorgprotocolPackage
