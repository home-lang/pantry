/**
 * **sketchybar** - A highly customizable macOS status bar replacement
 *
 * @domain `felixkratz.github.io/SketchyBar`
 * @programs `sketchybar`
 * @version `2.23.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install felixkratz.github.io/SketchyBar`
 * @homepage https://felixkratz.github.io/SketchyBar/
 * @dependencies `github.com/koekeishiya/yabai`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.felixkratzgithubiosketchybar
 * console.log(pkg.name)        // "sketchybar"
 * console.log(pkg.description) // "A highly customizable macOS status bar replacement"
 * console.log(pkg.programs)    // ["sketchybar"]
 * console.log(pkg.versions[0]) // "2.23.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/felixkratz-github-io/SketchyBar.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const felixkratzgithubiosketchybarPackage = {
  /**
   * The display name of this package.
   */
  name: 'sketchybar' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'felixkratz.github.io/SketchyBar' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A highly customizable macOS status bar replacement' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/felixkratz.github.io/SketchyBar/package.yml' as const,
  homepageUrl: 'https://felixkratz.github.io/SketchyBar/' as const,
  githubUrl: 'https://github.com/FelixKratz/SketchyBar' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install felixkratz.github.io/SketchyBar' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +felixkratz.github.io/SketchyBar -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install felixkratz.github.io/SketchyBar' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sketchybar',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'github.com/koekeishiya/yabai',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.23.0',
    '2.22.1',
    '2.22.0',
    '2.21.0',
    '2.20.1',
    '2.20.0',
  ] as const,
  aliases: [] as const,
}

export type FelixkratzgithubiosketchybarPackage = typeof felixkratzgithubiosketchybarPackage
