/**
 * **lzo** - pkgx package
 *
 * @domain `oberhumer.com/lzo`
 * @version `2.10.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install oberhumer.com/lzo`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.oberhumercomlzo
 * console.log(pkg.name)        // "lzo"
 * console.log(pkg.versions[0]) // "2.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/oberhumer-com/lzo.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const oberhumercomlzoPackage = {
  /**
  * The display name of this package.
  */
  name: 'lzo' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'oberhumer.com/lzo' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/oberhumer.com/lzo/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install oberhumer.com/lzo' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +oberhumer.com/lzo -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install oberhumer.com/lzo' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.10.0',
  ] as const,
  aliases: [] as const,
}

export type OberhumercomlzoPackage = typeof oberhumercomlzoPackage
