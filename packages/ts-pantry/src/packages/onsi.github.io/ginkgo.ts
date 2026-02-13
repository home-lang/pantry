/**
 * **ginkgo** - A Modern Testing Framework for Go
 *
 * @domain `onsi.github.io/ginkgo`
 * @programs `ginkgo`
 * @version `2.27.5` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install onsi.github.io/ginkgo`
 * @homepage http://onsi.github.io/ginkgo/
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.onsigithubioginkgo
 * console.log(pkg.name)        // "ginkgo"
 * console.log(pkg.description) // "A Modern Testing Framework for Go"
 * console.log(pkg.programs)    // ["ginkgo"]
 * console.log(pkg.versions[0]) // "2.27.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/onsi-github-io/ginkgo.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const onsigithubioginkgoPackage = {
  /**
   * The display name of this package.
   */
  name: 'ginkgo' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'onsi.github.io/ginkgo' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A Modern Testing Framework for Go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/onsi.github.io/ginkgo/package.yml' as const,
  homepageUrl: 'http://onsi.github.io/ginkgo/' as const,
  githubUrl: 'https://github.com/onsi/ginkgo' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install onsi.github.io/ginkgo' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +onsi.github.io/ginkgo -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install onsi.github.io/ginkgo' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ginkgo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.27.5',
    '2.27.4',
    '2.27.3',
    '2.27.2',
    '2.27.1',
    '2.27.0',
    '2.26.0',
    '2.25.3',
    '2.25.2',
    '2.25.1',
    '2.25.0',
    '2.24.0',
    '2.23.4',
    '2.23.3',
    '2.23.2',
    '2.23.1',
    '2.23.0',
    '2.22.2',
    '2.22.1',
    '2.22.0',
    '2.21.0',
    '2.20.2',
    '2.20.1',
    '2.20.0',
    '2.19.1',
    '2.19.0',
    '2.18.0',
  ] as const,
  aliases: [] as const,
}

export type OnsigithubioginkgoPackage = typeof onsigithubioginkgoPackage
