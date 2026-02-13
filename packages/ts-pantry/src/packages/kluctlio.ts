/**
 * **kluctl** - The missing glue to put together large Kubernetes deployments, composed of multiple smaller parts (Helm/Kustomize/...)  in a manageable and unified way.
 *
 * @domain `kluctl.io`
 * @programs `kluctl`
 * @version `2.27.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kluctl.io`
 * @homepage https://kluctl.io
 * @buildDependencies `go.dev@^1.21`, `nodejs.org@^18`, `npmjs.com`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kluctlio
 * console.log(pkg.name)        // "kluctl"
 * console.log(pkg.description) // "The missing glue to put together large Kubernet..."
 * console.log(pkg.programs)    // ["kluctl"]
 * console.log(pkg.versions[0]) // "2.27.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kluctl-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kluctlioPackage = {
  /**
   * The display name of this package.
   */
  name: 'kluctl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'kluctl.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The missing glue to put together large Kubernetes deployments, composed of multiple smaller parts (Helm/Kustomize/...)  in a manageable and unified way.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kluctl.io/package.yml' as const,
  homepageUrl: 'https://kluctl.io' as const,
  githubUrl: 'https://github.com/kluctl/kluctl' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install kluctl.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kluctl.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kluctl.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'kluctl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
    'nodejs.org@^18',
    'npmjs.com',
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.27.0',
    '2.26.0',
    '2.25.1',
    '2.25.0',
    '2.24.1',
    '2.24.0',
    '2.23.5',
    '2.23.4',
    '2.23.3',
    '2.23.2',
    '2.23.1',
    '2.23.0',
    '2.22.1',
    '2.22.0',
    '2.21.2',
  ] as const,
  aliases: [] as const,
}

export type KluctlioPackage = typeof kluctlioPackage
