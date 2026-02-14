/**
 * **xcomposite** - pkgx package
 *
 * @domain `x.org/xcomposite`
 * @version `0.4.7` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xcomposite`
 * @dependencies `x.org/x11`, `x.org/xfixes`, `x.org/protocol`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxcomposite
 * console.log(pkg.name)        // "xcomposite"
 * console.log(pkg.versions[0]) // "0.4.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xcomposite.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxcompositePackage = {
  /**
  * The display name of this package.
  */
  name: 'xcomposite' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xcomposite' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xcomposite/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/xcomposite' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xcomposite -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xcomposite' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/x11',
    'x.org/xfixes',
    'x.org/protocol',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.7',
    '0.4.6',
  ] as const,
  aliases: [] as const,
}

export type XorgxcompositePackage = typeof xorgxcompositePackage
