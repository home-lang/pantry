/**
 * **cJSON** - Ultralightweight JSON parser in ANSI C
 *
 * @domain `github.com/DaveGamble/cJSON`
 * @version `1.7.19` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/DaveGamble/cJSON`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomdavegamblecjson
 * console.log(pkg.name)        // "cJSON"
 * console.log(pkg.description) // "Ultralightweight JSON parser in ANSI C"
 * console.log(pkg.versions[0]) // "1.7.19" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/DaveGamble/cJSON.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cjsonPackage = {
  /**
  * The display name of this package.
  */
  name: 'cJSON' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/DaveGamble/cJSON' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Ultralightweight JSON parser in ANSI C' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/DaveGamble/cJSON/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/DaveGamble/cJSON' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/DaveGamble/cJSON' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/DaveGamble/cJSON -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/DaveGamble/cJSON' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.7.19',
    '1.7.18',
    '1.7.17',
    '1.7.16',
    '1.7.15',
  ] as const,
  aliases: [] as const,
}

export type CjsonPackage = typeof cjsonPackage
