/**
 * **bun-profile** - Official Bun profiling runtime with its native ELF symbols preserved.
 *
 * @domain `bun.com/profile`
 * @programs `bun-profile`
 * @version `1.4.4` (21 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install bun.com/profile`
 * @homepage https://bun.com
 * @buildDependencies `curl.se`, `stedolan.github.io/jq^1`, `gnu.org/coreutils`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.buncomprofile
 * console.log(pkg.name)        // "bun-profile"
 * console.log(pkg.description) // "Official Bun profiling runtime with its native ..."
 * console.log(pkg.programs)    // ["bun-profile"]
 * console.log(pkg.versions[0]) // "1.4.4" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/bun-com/profile.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const bunprofilePackage = {
  /**
  * The display name of this package.
  */
  name: 'bun-profile' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'bun.com/profile' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Official Bun profiling runtime with its native ELF symbols preserved.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://bun.com' as const,
  githubUrl: 'https://github.com/oven-sh/bun' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install bun.com/profile' as const,
  pantryInstallCommand: 'pantry install bun.com/profile' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bun-profile',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'curl.se',
    'stedolan.github.io/jq^1',
    'gnu.org/coreutils',
    'info-zip.org/unzip',
    'gnu.org/binutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.14',
    '1.3.13',
    '1.3.12',
    '1.3.11',
    '1.3.10',
    '1.3.9',
    '1.3.8',
    '1.3.7',
    '1.3.6',
    '1.3.5',
    '1.3.4',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.23',
  ] as const,
  aliases: [] as const,
}

export type BunprofilePackage = typeof bunprofilePackage
