/**
 * **minisign** - A dead simple tool to sign files and verify digital signatures.
 *
 * @domain `jedisct1.github.io/minisign`
 * @programs `minisign`
 * @version `0.12.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jedisct1.github.io/minisign`
 * @homepage https://jedisct1.github.io/minisign/
 * @buildDependencies `cmake.org`, `libsodium.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jedisct1githubiominisign
 * console.log(pkg.name)        // "minisign"
 * console.log(pkg.description) // "A dead simple tool to sign files and verify dig..."
 * console.log(pkg.programs)    // ["minisign"]
 * console.log(pkg.versions[0]) // "0.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jedisct1-github-io/minisign.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jedisct1githubiominisignPackage = {
  /**
  * The display name of this package.
  */
  name: 'minisign' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'jedisct1.github.io/minisign' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A dead simple tool to sign files and verify digital signatures.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jedisct1.github.io/minisign/package.yml' as const,
  homepageUrl: 'https://jedisct1.github.io/minisign/' as const,
  githubUrl: 'https://github.com/jedisct1/minisign' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install jedisct1.github.io/minisign' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jedisct1.github.io/minisign -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jedisct1.github.io/minisign' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'minisign',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
    'libsodium.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.12.0',
    '0.11.0',
  ] as const,
  aliases: [] as const,
}

export type Jedisct1githubiominisignPackage = typeof jedisct1githubiominisignPackage
