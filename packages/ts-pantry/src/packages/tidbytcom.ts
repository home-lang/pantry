/**
 * **pixlet** - Build apps for pixel-based displays ✨
 *
 * @domain `tidbyt.com`
 * @programs `pixlet`
 * @version `0.34.0` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install tidbyt.com`
 * @homepage https://tidbyt.com
 * @dependencies `google.com/webp^1`
 * @buildDependencies `go.dev@^1.22`, `npmjs.com`, `nodejs.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.tidbytcom
 * console.log(pkg.name)        // "pixlet"
 * console.log(pkg.description) // "Build apps for pixel-based displays ✨"
 * console.log(pkg.programs)    // ["pixlet"]
 * console.log(pkg.versions[0]) // "0.34.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/tidbyt-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install tidbyt.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tidbyt.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install tidbyt.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
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
    '0.29.0',
    '0.28.7',
    '0.28.6',
    '0.28.5',
    '0.28.4',
    '0.28.3',
    '0.28.1',
    '0.28.0',
    '0.27.3',
    '0.27.2',
    '0.27.1',
    '0.27.0',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.3',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.8',
    '0.24.7',
    '0.24.6',
    '0.24.5',
    '0.24.4',
    '0.24.3',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.2',
    '0.23.1',
    '0.23.0',
  ] as const,
  aliases: [] as const,
}

export type TidbytcomPackage = typeof tidbytcomPackage
