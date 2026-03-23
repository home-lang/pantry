/**
 * **kubecm** - Manage your kubeconfig more easily.
 *
 * @domain `kubecm.cloud`
 * @programs `kubecm`
 * @version `0.35.1` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install kubecm.cloud`
 * @homepage https://kubecm.cloud
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.kubecmcloud
 * console.log(pkg.name)        // "kubecm"
 * console.log(pkg.description) // "Manage your kubeconfig more easily."
 * console.log(pkg.programs)    // ["kubecm"]
 * console.log(pkg.versions[0]) // "0.35.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/kubecm-cloud.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const kubecmcloudPackage = {
  /**
  * The display name of this package.
  */
  name: 'kubecm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kubecm.cloud' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Manage your kubeconfig more easily.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kubecm.cloud/package.yml' as const,
  homepageUrl: 'https://kubecm.cloud' as const,
  githubUrl: 'https://github.com/sunny0826/kubecm' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install kubecm.cloud' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kubecm.cloud -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install kubecm.cloud' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kubecm',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.22',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.35.1',
    '0.35.0',
    '0.34.0',
    '0.33.3',
    '0.33.2',
    '0.33.1',
    '0.33.0',
    '0.32.3',
    '0.32.2',
    '0.32.1',
    '0.32.0',
    '0.31.0',
    '0.30.0',
    '0.29.1',
    '0.29.0',
    '0.28.0',
    '0.27.1',
    '0.27.0',
    '0.26.0',
    '0.25.0',
  ] as const,
  aliases: [] as const,
}

export type KubecmcloudPackage = typeof kubecmcloudPackage
