/**
 * **gti** - ASCII-art displaying typo-corrector for commands
 *
 * @domain `r-wos.org/gti`
 * @programs `gti`
 * @version `1.9.1` (43 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install r-wos.org/gti`
 * @homepage https://r-wos.org/hacks/gti
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rwosorggti
 * console.log(pkg.name)        // "gti"
 * console.log(pkg.description) // "ASCII-art displaying typo-corrector for commands"
 * console.log(pkg.programs)    // ["gti"]
 * console.log(pkg.versions[0]) // "1.9.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/r-wos-org/gti.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rwosorggtiPackage = {
  /**
  * The display name of this package.
  */
  name: 'gti' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'r-wos.org/gti' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'ASCII-art displaying typo-corrector for commands' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/r-wos.org/gti/package.yml' as const,
  homepageUrl: 'https://r-wos.org/hacks/gti' as const,
  githubUrl: 'https://github.com/rwos/gti' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install r-wos.org/gti' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +r-wos.org/gti -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install r-wos.org/gti' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gti',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.1',
    '1.9.0',
    '1.8.0',
  ] as const,
  aliases: [] as const,
}

export type RwosorggtiPackage = typeof rwosorggtiPackage
