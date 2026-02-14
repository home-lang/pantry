/**
 * **blink** - tiniest x86-64-linux emulator
 *
 * @domain `github.com/jart/blink`
 * @programs `blink`, `blinkenlights`
 * @version `0.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/jart/blink`
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjartblink
 * console.log(pkg.name)        // "blink"
 * console.log(pkg.description) // "tiniest x86-64-linux emulator"
 * console.log(pkg.programs)    // ["blink", "blinkenlights"]
 * console.log(pkg.versions[0]) // "0.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/jart/blink.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const blinkPackage = {
  /**
  * The display name of this package.
  */
  name: 'blink' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/jart/blink' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'tiniest x86-64-linux emulator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jart/blink/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jart/blink' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/jart/blink' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/jart/blink -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/jart/blink' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'blink',
    'blinkenlights',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.0.0',
  ] as const,
  aliases: [] as const,
}

export type BlinkPackage = typeof blinkPackage
