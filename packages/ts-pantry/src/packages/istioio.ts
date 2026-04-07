/**
 * **istioctl** - Connect, secure, control, and observe services.
 *
 * @domain `istio.io`
 * @programs `istioctl`
 * @version `1.29.1` (67 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install istio.io`
 * @homepage https://istio.io/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.istioio
 * console.log(pkg.name)        // "istioctl"
 * console.log(pkg.description) // "Connect, secure, control, and observe services."
 * console.log(pkg.programs)    // ["istioctl"]
 * console.log(pkg.versions[0]) // "1.29.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/istio-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const istioioPackage = {
  /**
  * The display name of this package.
  */
  name: 'istioctl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'istio.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Connect, secure, control, and observe services.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/istio.io/package.yml' as const,
  homepageUrl: 'https://istio.io/' as const,
  githubUrl: 'https://github.com/istio/istio' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install istio.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +istio.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install istio.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'istioctl',
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
    '1.29.1',
    '1.29.0',
    '1.28.5',
    '1.28.4',
    '1.28.3',
    '1.28.2',
    '1.28.1',
    '1.28.0',
    '1.27.9',
    '1.27.8',
    '1.27.7',
    '1.27.6',
    '1.27.5',
    '1.27.4',
    '1.27.3',
    '1.27.2',
    '1.27.1',
    '1.27.0',
    '1.26.8',
    '1.26.7',
    '1.26.6',
    '1.26.5',
    '1.26.4',
    '1.26.3',
    '1.26.2',
    '1.26.1',
    '1.26.0',
    '1.25.5',
    '1.25.4',
    '1.25.3',
    '1.25.2',
    '1.25.1',
    '1.24.6',
    '1.24.5',
    '1.23.6',
  ] as const,
  aliases: [] as const,
}

export type IstioioPackage = typeof istioioPackage
