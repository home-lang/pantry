/**
 * **kube-linter** - KubeLinter is a static analysis tool that checks Kubernetes YAML files and Helm charts to ensure the applications represented in them adhere to best practices.
 *
 * @domain `kubelinter.io`
 * @programs `kube-linter`
 * @version `0.8.3` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install kubelinter.io`
 * @homepage https://docs.kubelinter.io/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.kubelinterio
 * console.log(pkg.name)        // "kube-linter"
 * console.log(pkg.description) // "KubeLinter is a static analysis tool that check..."
 * console.log(pkg.programs)    // ["kube-linter"]
 * console.log(pkg.versions[0]) // "0.8.3" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/kubelinter-io.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install kubelinter.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kubelinter.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install kubelinter.io' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.8.3',
    '0.8.2',
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
    '0.6.7',
    '0.6.6',
    '0.6.5',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.1',
    '0.5.0',
    '0.4.0',
    '0.3.0',
    '0.2.6',
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.6',
    '0.1.5',
    '0.1.4',
    '0.1.3',
    '0.1.2',
    '0.1.1',
    '0.1.0',
    '0.0.4',
    '0.0.3',
    '0.0.2',
  ] as const,
  aliases: [] as const,
}

export type KubelinterioPackage = typeof kubelinterioPackage
