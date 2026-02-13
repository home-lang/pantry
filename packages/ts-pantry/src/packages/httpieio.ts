/**
 * **httpie** - 🥧 HTTPie CLI  — modern, user-friendly command-line HTTP client for the API era. JSON support, colors, sessions, downloads, plugins & more.
 *
 * @domain `httpie.io`
 * @programs `http`, `httpie`, `https`
 * @version `3.2.4` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install httpie.io`
 * @homepage https://httpie.io/
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.httpieio
 * console.log(pkg.name)        // "httpie"
 * console.log(pkg.description) // "🥧 HTTPie CLI  — modern, user-friendly command-..."
 * console.log(pkg.programs)    // ["http", "httpie", ...]
 * console.log(pkg.versions[0]) // "3.2.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/httpie-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const httpieioPackage = {
  /**
   * The display name of this package.
   */
  name: 'httpie' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'httpie.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🥧 HTTPie CLI  — modern, user-friendly command-line HTTP client for the API era. JSON support, colors, sessions, downloads, plugins & more.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/httpie.io/package.yml' as const,
  homepageUrl: 'https://httpie.io/' as const,
  githubUrl: 'https://github.com/httpie/cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install httpie.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +httpie.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install httpie.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'http',
    'httpie',
    'https',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
  ] as const,
  aliases: [] as const,
}

export type HttpieioPackage = typeof httpieioPackage
