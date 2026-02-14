/**
 * **pixlet** - Build apps for pixel-based displays ✨
 *
 * @domain `tidbyt.com`
 * @programs `pixlet`
 * @version `0.34.0` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tidbyt.com`
 * @homepage https://tidbyt.com
 * @dependencies `google.com/webp^1`
 * @buildDependencies `go.dev@^1.22`, `npmjs.com`, `nodejs.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tidbytcom
 * console.log(pkg.name)        // "pixlet"
 * console.log(pkg.description) // "Build apps for pixel-based displays ✨"
 * console.log(pkg.programs)    // ["pixlet"]
 * console.log(pkg.versions[0]) // "0.34.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tidbyt-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tidbytcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'pixlet' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tidbyt.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Build apps for pixel-based displays ✨' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tidbyt.com/package.yml' as const,
  homepageUrl: 'https://tidbyt.com' as const,
  githubUrl: 'https://github.com/tidbyt/pixlet' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install tidbyt.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tidbyt.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tidbyt.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pixlet',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'google.com/webp^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.22',
    'npmjs.com',
    'nodejs.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.34.0',
    '0.33.5',
    '0.33.4',
    '0.33.3',
    '0.33.2',
    '0.33.1',
    '0.33.0',
    '0.32.7',
    '0.32.6',
    '0.32.5',
    '0.32.4',
    '0.32.3',
    '0.32.2',
    '0.32.1',
    '0.32.0',
    '0.31.0',
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.1',
  ] as const,
  aliases: [] as const,
}

export type TidbytcomPackage = typeof tidbytcomPackage
