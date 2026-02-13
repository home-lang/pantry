/**
 * **k9s** - 🐶 Kubernetes CLI To Manage Your Clusters In Style!
 *
 * @domain `k9scli.io`
 * @programs `k9s`
 * @version `0.50.18` (64 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install k9scli.io`
 * @homepage https://k9scli.io/
 * @buildDependencies `go.dev@^1.18`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.k9scliio
 * console.log(pkg.name)        // "k9s"
 * console.log(pkg.description) // "🐶 Kubernetes CLI To Manage Your Clusters In St..."
 * console.log(pkg.programs)    // ["k9s"]
 * console.log(pkg.versions[0]) // "0.50.18" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/k9scli-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const k9scliioPackage = {
  /**
   * The display name of this package.
   */
  name: 'k9s' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'k9scli.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🐶 Kubernetes CLI To Manage Your Clusters In Style!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/k9scli.io/package.yml' as const,
  homepageUrl: 'https://k9scli.io/' as const,
  githubUrl: 'https://github.com/derailed/k9s' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install k9scli.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +k9scli.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install k9scli.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'k9s',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.50.18',
    '0.50.17',
    '0.50.16',
    '0.50.15',
    '0.50.14',
    '0.50.13',
    '0.50.12',
    '0.50.11',
    '0.50.10',
    '0.50.9',
    '0.50.8',
    '0.50.7',
    '0.50.6',
    '0.50.5',
    '0.50.4',
    '0.50.3',
    '0.50.2',
    '0.50.1',
    '0.50.0',
    '0.40.10',
    '0.40.9',
    '0.40.8',
    '0.40.7',
    '0.40.6',
    '0.40.5',
    '0.40.4',
    '0.40.3',
    '0.40.2',
    '0.40.1',
    '0.40.0',
    '0.32.7',
    '0.32.6',
    '0.32.5',
    '0.32.4',
    '0.32.3',
    '0.32.2',
    '0.32.1',
    '0.32.0',
    '0.31.9',
    '0.31.8',
    '0.31.7',
    '0.31.6',
    '0.31.5',
    '0.31.4',
    '0.31.3',
    '0.31.2',
    '0.31.1',
    '0.31.0',
    '0.30.8',
    '0.30.7',
    '0.30.6',
    '0.30.5',
    '0.30.4',
    '0.30.3',
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.1',
    '0.29.0',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.4',
    '0.27.3',
  ] as const,
  aliases: [] as const,
}

export type K9scliioPackage = typeof k9scliioPackage
