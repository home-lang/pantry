/**
 * **termshark** - pkgx package
 *
 * @domain `termshark.io`
 * @programs `termshark`
 * @version `2.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install termshark.io`
 * @dependencies `wireshark.org`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.termsharkio
 * console.log(pkg.name)        // "termshark"
 * console.log(pkg.programs)    // ["termshark"]
 * console.log(pkg.versions[0]) // "2.4.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/termshark-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const termsharkioPackage = {
  /**
  * The display name of this package.
  */
  name: 'termshark' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'termshark.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/termshark.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install termshark.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +termshark.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install termshark.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'termshark',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'wireshark.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.4.0',
    '2.3.0',
    '2.2.0',
    '2.1.1',
    '2.0.3',
    '2.0.0',
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type TermsharkioPackage = typeof termsharkioPackage
