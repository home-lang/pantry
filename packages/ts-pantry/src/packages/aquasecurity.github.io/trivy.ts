/**
 * **trivy** - Find vulnerabilities, misconfigurations, secrets, SBOM in containers, Kubernetes, code repositories, clouds and more
 *
 * @domain `aquasecurity.github.io/trivy`
 * @programs `trivy`
 * @version `0.69.1` (45 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install aquasecurity.github.io/trivy`
 * @homepage https://aquasecurity.github.io/trivy/
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@=1.25`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.aquasecuritygithubiotrivy
 * console.log(pkg.name)        // "trivy"
 * console.log(pkg.description) // "Find vulnerabilities, misconfigurations, secret..."
 * console.log(pkg.programs)    // ["trivy"]
 * console.log(pkg.versions[0]) // "0.69.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/aquasecurity-github-io/trivy.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const aquasecuritygithubiotrivyPackage = {
  /**
  * The display name of this package.
  */
  name: 'trivy' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'aquasecurity.github.io/trivy' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Find vulnerabilities, misconfigurations, secrets, SBOM in containers, Kubernetes, code repositories, clouds and more' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/aquasecurity.github.io/trivy/package.yml' as const,
  homepageUrl: 'https://aquasecurity.github.io/trivy/' as const,
  githubUrl: 'https://github.com/aquasecurity/trivy' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install aquasecurity.github.io/trivy' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +aquasecurity.github.io/trivy -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install aquasecurity.github.io/trivy' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'trivy',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'go.dev@=1.25',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.69.1',
    '0.69.0',
    '0.68.2',
    '0.68.1',
    '0.67.2',
    '0.66.0',
    '0.65.0',
    '0.64.1',
    '0.64.0',
    '0.63.0',
    '0.62.1',
    '0.62.0',
    '0.61.1',
    '0.61.0',
    '0.60.0',
    '0.59.1',
    '0.59.0',
    '0.58.2',
    '0.58.1',
    '0.58.0',
    '0.57.1',
    '0.57.0',
    '0.56.2',
    '0.56.1',
    '0.56.0',
    '0.55.2',
    '0.55.1',
    '0.55.0',
    '0.54.1',
    '0.54.0',
    '0.53.0',
    '0.52.2',
    '0.52.1',
    '0.52.0',
    '0.51.4',
    '0.51.2',
    '0.51.1',
    '0.51.0',
    '0.50.4',
    '0.50.2',
    '0.50.1',
    '0.50.0',
    '0.49.1',
    '0.49.0',
    '0.48.3',
  ] as const,
  aliases: [] as const,
}

export type AquasecuritygithubiotrivyPackage = typeof aquasecuritygithubiotrivyPackage
