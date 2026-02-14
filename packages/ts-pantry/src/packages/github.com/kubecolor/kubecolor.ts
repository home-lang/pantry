/**
 * **kubecolor** - Colorize your kubectl output
 *
 * @domain `github.com/kubecolor/kubecolor`
 * @programs `kubecolor`
 * @version `0.5.3` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/kubecolor/kubecolor`
 * @homepage https://kubecolor.github.io/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkubecolorkubecolor
 * console.log(pkg.name)        // "kubecolor"
 * console.log(pkg.description) // "Colorize your kubectl output"
 * console.log(pkg.programs)    // ["kubecolor"]
 * console.log(pkg.versions[0]) // "0.5.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/kubecolor/kubecolor.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kubecolorPackage = {
  /**
  * The display name of this package.
  */
  name: 'kubecolor' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/kubecolor/kubecolor' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Colorize your kubectl output' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kubecolor/kubecolor/package.yml' as const,
  homepageUrl: 'https://kubecolor.github.io/' as const,
  githubUrl: 'https://github.com/kubecolor/kubecolor' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/kubecolor/kubecolor' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kubecolor/kubecolor -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/kubecolor/kubecolor' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kubecolor',
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
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.0',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.2',
  ] as const,
  aliases: [] as const,
}

export type KubecolorPackage = typeof kubecolorPackage
