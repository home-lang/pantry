/**
 * **ko** - Build and deploy Go applications on Kubernetes
 *
 * @domain `ko.build`
 * @programs `ko`
 * @version `0.18.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ko.build`
 * @homepage https://ko.build
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.kobuild
 * console.log(pkg.name)        // "ko"
 * console.log(pkg.description) // "Build and deploy Go applications on Kubernetes"
 * console.log(pkg.programs)    // ["ko"]
 * console.log(pkg.versions[0]) // "0.18.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/ko-build.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const kobuildPackage = {
  /**
  * The display name of this package.
  */
  name: 'ko' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ko.build' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Build and deploy Go applications on Kubernetes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ko.build/package.yml' as const,
  homepageUrl: 'https://ko.build' as const,
  githubUrl: 'https://github.com/ko-build/ko' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install ko.build' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ko.build -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install ko.build' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ko',
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
    '0.18.1',
    '0.18.0',
    '0.17.1',
    '0.17.0',
    '0.16.0',
    '0.15.4',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.1',
    '0.14.0',
    '0.13.0',
    '0.12.0',
    '0.11.2',
    '0.11.1',
    '0.11.0',
    '0.10.0',
    '0.9.3',
    '0.9.2',
    '0.9.1',
  ] as const,
  aliases: [] as const,
}

export type KobuildPackage = typeof kobuildPackage
