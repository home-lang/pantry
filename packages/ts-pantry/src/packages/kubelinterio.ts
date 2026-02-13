/**
 * **kube-linter** - KubeLinter is a static analysis tool that checks Kubernetes YAML files and Helm charts to ensure the applications represented in them adhere to best practices.
 *
 * @domain `kubelinter.io`
 * @programs `kube-linter`
 * @version `0.8.1` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kubelinter.io`
 * @homepage https://docs.kubelinter.io/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kubelinterio
 * console.log(pkg.name)        // "kube-linter"
 * console.log(pkg.description) // "KubeLinter is a static analysis tool that check..."
 * console.log(pkg.programs)    // ["kube-linter"]
 * console.log(pkg.versions[0]) // "0.8.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kubelinter-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kubelinterioPackage = {
  /**
   * The display name of this package.
   */
  name: 'kube-linter' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'kubelinter.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'KubeLinter is a static analysis tool that checks Kubernetes YAML files and Helm charts to ensure the applications represented in them adhere to best practices.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kubelinter.io/package.yml' as const,
  homepageUrl: 'https://docs.kubelinter.io/' as const,
  githubUrl: 'https://github.com/stackrox/kube-linter' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install kubelinter.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kubelinter.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kubelinter.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'kube-linter',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.1',
    '0.8.0',
    '0.7.6',
    '0.7.5',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.8',
  ] as const,
  aliases: [] as const,
}

export type KubelinterioPackage = typeof kubelinterioPackage
