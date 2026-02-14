/**
 * **alacritty** - A cross-platform, OpenGL terminal emulator.
 *
 * @domain `alacritty.org`
 * @programs `alacritty`
 * @version `0.16.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install alacritty.org`
 * @homepage https://alacritty.org
 * @dependencies `linux:freetype.org`, `linux:freedesktop.org/fontconfig` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.alacrittyorg
 * console.log(pkg.name)        // "alacritty"
 * console.log(pkg.description) // "A cross-platform, OpenGL terminal emulator."
 * console.log(pkg.programs)    // ["alacritty"]
 * console.log(pkg.versions[0]) // "0.16.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/alacritty-org.md
 * @see https://ts-pkgx.netlify.app/usage
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
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install alacritty.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +alacritty.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install alacritty.org' as const,
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
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.16.1',
    '0.16.0',
    '0.15.1',
    '0.15.0',
    '0.14.0',
    '0.13.2',
  ] as const,
  aliases: [] as const,
}

export type AlacrittyorgPackage = typeof alacrittyorgPackage
