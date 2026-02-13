/**
 * **micro** - A modern and intuitive terminal-based text editor
 *
 * @domain `micro-editor.github.io`
 * @programs `micro`
 * @version `2.0.15` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install micro-editor.github.io`
 * @homepage https://micro-editor.github.io
 * @buildDependencies `go.dev@^1.16` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.microeditorgithubio
 * console.log(pkg.name)        // "micro"
 * console.log(pkg.description) // "A modern and intuitive terminal-based text editor"
 * console.log(pkg.programs)    // ["micro"]
 * console.log(pkg.versions[0]) // "2.0.15" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/micro-editor-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const microeditorgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'micro' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'micro-editor.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A modern and intuitive terminal-based text editor' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/micro-editor.github.io/package.yml' as const,
  homepageUrl: 'https://micro-editor.github.io' as const,
  githubUrl: 'https://github.com/zyedidia/micro' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install micro-editor.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +micro-editor.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install micro-editor.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'micro',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.16',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.0.15',
    '2.0.14',
    '2.0.13',
    '2.0.12',
    '2.0.11',
  ] as const,
  aliases: [] as const,
}

export type MicroeditorgithubioPackage = typeof microeditorgithubioPackage
