/**
 * **k6** - A modern load testing tool, using Go and JavaScript - https://k6.io
 *
 * @domain `k6.io`
 * @programs `k6`
 * @version `1.5.0` (34 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install k6.io`
 * @homepage https://k6.io
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.k6io
 * console.log(pkg.name)        // "k6"
 * console.log(pkg.description) // "A modern load testing tool, using Go and JavaSc..."
 * console.log(pkg.programs)    // ["k6"]
 * console.log(pkg.versions[0]) // "1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/k6-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const k6ioPackage = {
  /**
   * The display name of this package.
   */
  name: 'k6' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'k6.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A modern load testing tool, using Go and JavaScript - https://k6.io' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/k6.io/package.yml' as const,
  homepageUrl: 'https://k6.io' as const,
  githubUrl: 'https://github.com/grafana/k6' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install k6.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +k6.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install k6.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'k6',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.0',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.0',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.0',
    '1.0.0',
    '0.59.0',
    '0.58.0',
    '0.57.0',
    '0.56.0',
    '0.55.2',
    '0.55.1',
    '0.55.0',
    '0.54.0',
    '0.53.0',
    '0.52.0',
    '0.51.0',
    '0.50.0',
    '0.49.0',
    '0.48.0',
    '0.47.0',
    '0.46.0',
    '0.45.1',
    '0.45.0',
    '0.44.1',
    '0.44.0',
    '0.43.1',
    '0.43.0',
    '0.42.0',
  ] as const,
  aliases: [] as const,
}

export type K6ioPackage = typeof k6ioPackage
