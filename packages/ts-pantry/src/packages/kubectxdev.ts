/**
 * **kube** - Tool that can switch between kubectl contexts easily and create aliases
 *
 * @domain `kubectx.dev`
 * @programs `kubectx`, `kubens`
 * @version `0.10.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install kubectx.dev`
 * @homepage https://kubectx.dev
 * @dependencies `github.com/junegunn/fzf`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.kubectxdev
 * console.log(pkg.name)        // "kube"
 * console.log(pkg.description) // "Tool that can switch between kubectl contexts e..."
 * console.log(pkg.programs)    // ["kubectx", "kubens"]
 * console.log(pkg.versions[0]) // "0.10.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/kubectx-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const kubectxdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'kube' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kubectx.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Tool that can switch between kubectl contexts easily and create aliases' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kubectx.dev/package.yml' as const,
  homepageUrl: 'https://kubectx.dev' as const,
  githubUrl: 'https://github.com/ahmetb/kubectx' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install kubectx.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kubectx.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install kubectx.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kubectx',
    'kubens',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'github.com/junegunn/fzf',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.2',
    '0.10.1',
    '0.10.1-rc.1',
    '0.10.0',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.0',
    '0.7.1',
    '0.7.0',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.1',
    '0.5.0',
    '0.4.1',
    '0.4.0',
    '0.3.1',
    '0.3.0',
    '0.2.0',
    '0.1',
  ] as const,
  aliases: [] as const,
}

export type KubectxdevPackage = typeof kubectxdevPackage
