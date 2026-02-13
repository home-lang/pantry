/**
 * **operator-sdk** - SDK for building Kubernetes applications. Provides high level APIs, useful abstractions, and project scaffolding.
 *
 * @domain `operatorframework.io/operator-sdk`
 * @programs `operator-sdk`
 * @version `1.42.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install operatorframework.io/operator-sdk`
 * @homepage https://sdk.operatorframework.io/
 * @dependencies `go.dev^1.19`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.operatorframeworkiooperatorsdk
 * console.log(pkg.name)        // "operator-sdk"
 * console.log(pkg.description) // "SDK for building Kubernetes applications. Provi..."
 * console.log(pkg.programs)    // ["operator-sdk"]
 * console.log(pkg.versions[0]) // "1.42.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/operatorframework-io/operator-sdk.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const operatorframeworkiooperatorsdkPackage = {
  /**
   * The display name of this package.
   */
  name: 'operator-sdk' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'operatorframework.io/operator-sdk' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'SDK for building Kubernetes applications. Provides high level APIs, useful abstractions, and project scaffolding.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/operatorframework.io/operator-sdk/package.yml' as const,
  homepageUrl: 'https://sdk.operatorframework.io/' as const,
  githubUrl: 'https://github.com/operator-framework/operator-sdk' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install operatorframework.io/operator-sdk' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +operatorframework.io/operator-sdk -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install operatorframework.io/operator-sdk' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'operator-sdk',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'go.dev^1.19',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.42.0',
    '1.41.1',
    '1.41.0',
    '1.40.0',
    '1.39.2',
    '1.39.1',
    '1.39.0',
    '1.38.0',
    '1.37.0',
    '1.36.1',
    '1.36.0',
    '1.35.0',
    '1.34.2',
    '1.34.1',
    '1.34.0',
    '1.33.0',
    '1.32.0',
  ] as const,
  aliases: [] as const,
}

export type OperatorframeworkiooperatorsdkPackage = typeof operatorframeworkiooperatorsdkPackage
