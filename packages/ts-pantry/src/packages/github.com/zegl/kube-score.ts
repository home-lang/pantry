/**
 * **kube-score** - Kubernetes object analysis with recommendations for improved reliability and security. kube-score actively prevents downtime and bugs in your Kubernetes YAML and Charts. Static code analysis for Kubernetes.
 *
 * @domain `github.com/zegl/kube-score`
 * @programs `kube-score`
 * @version `1.20.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/zegl/kube-score`
 * @homepage https://kube-score.com
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomzeglkubescore
 * console.log(pkg.name)        // "kube-score"
 * console.log(pkg.description) // "Kubernetes object analysis with recommendations..."
 * console.log(pkg.programs)    // ["kube-score"]
 * console.log(pkg.versions[0]) // "1.20.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/zegl/kube-score.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kubescorePackage = {
  /**
  * The display name of this package.
  */
  name: 'kube-score' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/zegl/kube-score' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Kubernetes object analysis with recommendations for improved reliability and security. kube-score actively prevents downtime and bugs in your Kubernetes YAML and Charts. Static code analysis for Kubernetes.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/zegl/kube-score/package.yml' as const,
  homepageUrl: 'https://kube-score.com' as const,
  githubUrl: 'https://github.com/zegl/kube-score' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/zegl/kube-score' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/zegl/kube-score -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/zegl/kube-score' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kube-score',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.20.0',
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.15.0',
    '1.14.0',
  ] as const,
  aliases: [] as const,
}

export type KubescorePackage = typeof kubescorePackage
