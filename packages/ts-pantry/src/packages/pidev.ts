/**
 * **pi** - pkgx package
 *
 * @domain `pi.dev`
 * @version `0.55.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pi.dev`
 * @dependencies `nodejs.org^20`, `github.com/mikefarah/yq`, `stedolan.github.io/jq`, ... (+1 more)
 * @buildDependencies `nodejs.org@^20`, `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pidev
 * console.log(pkg.name)        // "pi"
 * console.log(pkg.versions[0]) // "0.55.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pi-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pidevPackage = {
  /**
  * The display name of this package.
  */
  name: 'pi' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'pi.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pi.dev/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install pi.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pi.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pi.dev' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org^20',
    'github.com/mikefarah/yq',
    'stedolan.github.io/jq',
    'gnu.org/sed',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'nodejs.org@^20',
    'npmjs.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.55.2',
    '0.55.1',
  ] as const,
  aliases: [] as const,
}

export type PidevPackage = typeof pidevPackage
