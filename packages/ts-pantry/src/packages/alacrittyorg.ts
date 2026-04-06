/**
 * **alacritty** - A cross-platform, OpenGL terminal emulator.
 *
 * @domain `alacritty.org`
 * @programs `alacritty`
 * @version `0.16.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install alacritty.org`
 * @homepage https://alacritty.org
 * @dependencies `linux:freetype.org`, `linux:freedesktop.org/fontconfig` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.alacrittyorg
 * console.log(pkg.name)        // "alacritty"
 * console.log(pkg.description) // "A cross-platform, OpenGL terminal emulator."
 * console.log(pkg.programs)    // ["alacritty"]
 * console.log(pkg.versions[0]) // "0.16.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/alacritty-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const alacrittyorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'alacritty' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'alacritty.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A cross-platform, OpenGL terminal emulator.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/alacritty.org/package.yml' as const,
  homepageUrl: 'https://alacritty.org' as const,
  githubUrl: 'https://github.com/alacritty/alacritty' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install alacritty.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +alacritty.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install alacritty.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'alacritty',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:freetype.org',
    'linux:freedesktop.org/fontconfig',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.17.0',
    '0.16.1',
    '0.16.0',
    '0.15.1',
    '0.15.0',
    '0.14.0',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.3',
    '0.12.2',
    '0.12.1',
    '0.12.0',
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.0',
    '0.8.0',
  ] as const,
  aliases: [] as const,
}

export type AlacrittyorgPackage = typeof alacrittyorgPackage
