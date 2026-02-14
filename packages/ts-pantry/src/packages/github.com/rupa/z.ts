/**
 * **z** - z - jump around
 *
 * @domain `github.com/rupa/z`
 * @version `1.12.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/rupa/z`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomrupaz
 * console.log(pkg.name)        // "z"
 * console.log(pkg.description) // "z - jump around"
 * console.log(pkg.versions[0]) // "1.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/rupa/z.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zPackage = {
  /**
  * The display name of this package.
  */
  name: 'z' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/rupa/z' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'z - jump around' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/rupa/z/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/rupa/z' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/rupa/z' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/rupa/z -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/rupa/z' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.12.0',
  ] as const,
  aliases: [] as const,
}

export type ZPackage = typeof zPackage
