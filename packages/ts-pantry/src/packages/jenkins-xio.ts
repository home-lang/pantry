/**
 * **Jenkins X** - Jenkins X provides automated CI+CD for Kubernetes with Preview Environments on Pull Requests using Cloud Native pipelines from Tekton
 *
 * @domain `jenkins-x.io`
 * @programs `jx`
 * @version `3.16.43` (83 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jenkins-x.io`
 * @homepage https://jenkins-x.io/
 * @buildDependencies `go.dev@~1.23` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jenkinsxio
 * console.log(pkg.name)        // "Jenkins X"
 * console.log(pkg.description) // "Jenkins X provides automated CI+CD for Kubernet..."
 * console.log(pkg.programs)    // ["jx"]
 * console.log(pkg.versions[0]) // "3.16.43" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jenkins-x-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jenkinsxioPackage = {
  /**
   * The display name of this package.
   */
  name: 'Jenkins X' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'jenkins-x.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Jenkins X provides automated CI+CD for Kubernetes with Preview Environments on Pull Requests using Cloud Native pipelines from Tekton' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jenkins-x.io/package.yml' as const,
  homepageUrl: 'https://jenkins-x.io/' as const,
  githubUrl: 'https://github.com/jenkins-x/jx' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install jenkins-x.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jenkins-x.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jenkins-x.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jx',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.23',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.16.43',
    '3.16.41',
    '3.16.40',
    '3.16.39',
    '3.16.35',
    '3.16.34',
    '3.16.29',
    '3.16.28',
    '3.16.26',
    '3.16.25',
    '3.16.24',
    '3.16.21',
    '3.16.19',
    '3.16.18',
    '3.16.13',
    '3.16.10',
    '3.16.4',
    '3.16.1',
    '3.16.0',
    '3.11.116',
    '3.11.113',
    '3.11.111',
    '3.11.108',
    '3.11.107',
    '3.11.105',
    '3.11.92',
    '3.11.90',
    '3.11.87',
    '3.11.81',
    '3.11.78',
    '3.11.77',
    '3.11.76',
    '3.11.75',
    '3.11.74',
    '3.11.71',
    '3.11.70',
    '3.11.69',
    '3.11.66',
    '3.11.65',
    '3.11.63',
    '3.11.56',
    '3.11.52',
    '3.11.49',
    '3.11.48',
    '3.11.45',
    '3.11.44',
    '3.11.41',
    '3.11.39',
    '3.11.38',
    '3.11.27',
    '3.11.26',
    '3.11.25',
    '3.11.24',
    '3.11.21',
    '3.11.17',
    '3.11.14',
    '3.11.11',
    '3.11.10',
    '3.11.8',
    '3.11.7',
    '3.11.5',
    '3.11.4',
    '3.11.2',
    '3.11.1',
    '3.11.0',
    '3.10.182',
    '3.10.181',
    '3.10.180',
    '3.10.178',
    '3.10.177',
    '3.10.176',
    '3.10.172',
    '3.10.170',
    '3.10.169',
    '3.10.167',
    '3.10.166',
    '3.10.161',
    '3.10.160',
    '3.10.158',
    '3.10.157',
    '3.10.156',
    '3.10.155',
    '3.10.154',
  ] as const,
  aliases: [] as const,
}

export type JenkinsxioPackage = typeof jenkinsxioPackage
