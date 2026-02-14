/**
 * **xau** - pkgx package
 *
 * @domain `x.org/xau`
 * @version `1.0.12` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install x.org/xau`
 * @dependencies `x.org/util-macros`, `x.org/protocol`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xorgxau
 * console.log(pkg.name)        // "xau"
 * console.log(pkg.versions[0]) // "1.0.12" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/x-org/xau.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xorgxauPackage = {
  /**
  * The display name of this package.
  */
  name: 'xau' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'x.org/xau' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xau/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install x.org/xau' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +x.org/xau -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install x.org/xau' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'x.org/util-macros',
    'x.org/protocol',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.0.12',
    '1.0.11',
  ] as const,
  aliases: [] as const,
}

export type XorgxauPackage = typeof xorgxauPackage
