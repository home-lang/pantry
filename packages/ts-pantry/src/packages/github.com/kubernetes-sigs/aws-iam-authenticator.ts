/**
 * **aws-iam-authenticator** - A tool to use AWS IAM credentials to authenticate to a Kubernetes cluster
 *
 * @domain `github.com/kubernetes-sigs/aws-iam-authenticator`
 * @programs `aws-iam-authenticator`
 * @version `0.7.10` (28 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/kubernetes-sigs/aws-iam-authenticator`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkubernetessigsawsiamauthenticator
 * console.log(pkg.name)        // "aws-iam-authenticator"
 * console.log(pkg.description) // "A tool to use AWS IAM credentials to authentica..."
 * console.log(pkg.programs)    // ["aws-iam-authenticator"]
 * console.log(pkg.versions[0]) // "0.7.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/kubernetes-sigs/aws-iam-authenticator.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const awsiamauthenticatorPackage = {
  /**
   * The display name of this package.
   */
  name: 'aws-iam-authenticator' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/kubernetes-sigs/aws-iam-authenticator' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool to use AWS IAM credentials to authenticate to a Kubernetes cluster' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kubernetes-sigs/aws-iam-authenticator/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kubernetes-sigs/aws-iam-authenticator' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/kubernetes-sigs/aws-iam-authenticator' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kubernetes-sigs/aws-iam-authenticator -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/kubernetes-sigs/aws-iam-authenticator' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'aws-iam-authenticator',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.10',
    '0.7.9',
    '0.7.8',
    '0.7.7',
    '0.7.6',
    '0.7.5',
    '0.7.4',
    '0.7.3',
    '0.7.2',
    '0.7.1',
    '0.6.31',
    '0.6.30',
    '0.6.29',
    '0.6.28',
    '0.6.27',
    '0.6.26',
    '0.6.25',
    '0.6.24',
    '0.6.23',
    '0.6.22',
    '0.6.21',
    '0.6.14',
    '0.6.13',
    '0.6.12',
    '0.6.11',
    '0.5.27',
    '0.5.21',
    '0.5.20',
  ] as const,
  aliases: [] as const,
}

export type AwsiamauthenticatorPackage = typeof awsiamauthenticatorPackage
