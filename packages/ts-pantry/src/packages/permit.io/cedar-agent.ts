/**
 * **cedar-agent** - Cedar-agent is the easiest way to deploy and run Cedar
 *
 * @domain `permit.io/cedar-agent`
 * @programs `cedar-agent`
 * @version `0.2.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install permit.io/cedar-agent`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.permitiocedaragent
 * console.log(pkg.name)        // "cedar-agent"
 * console.log(pkg.description) // "Cedar-agent is the easiest way to deploy and ru..."
 * console.log(pkg.programs)    // ["cedar-agent"]
 * console.log(pkg.versions[0]) // "0.2.2" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/permit-io/cedar-agent.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const permitiocedaragentPackage = {
  /**
  * The display name of this package.
  */
  name: 'cedar-agent' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'permit.io/cedar-agent' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Cedar-agent is the easiest way to deploy and run Cedar' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/permit.io/cedar-agent/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/permitio/cedar-agent' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install permit.io/cedar-agent' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +permit.io/cedar-agent -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install permit.io/cedar-agent' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cedar-agent',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.4',
    '0.1.3',
  ] as const,
  aliases: [] as const,
}

export type PermitiocedaragentPackage = typeof permitiocedaragentPackage
