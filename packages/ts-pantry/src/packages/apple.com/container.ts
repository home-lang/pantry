/**
 * **container** - pkgx package
 *
 * @domain `apple.com/container`
 * @version `0.10.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apple.com/container`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.applecomcontainer
 * console.log(pkg.name)        // "container"
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apple-com/container.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const applecomcontainerPackage = {
  /**
  * The display name of this package.
  */
  name: 'container' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'apple.com/container' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apple.com/container/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install apple.com/container' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apple.com/container -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apple.com/container' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.0',
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type ApplecomcontainerPackage = typeof applecomcontainerPackage
