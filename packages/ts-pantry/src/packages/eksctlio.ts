/**
 * **eksctl** - Simple command-line tool for creating clusters on Amazon EKS
 *
 * @domain `eksctl.io`
 * @programs `eksctl`
 * @version `0.221.0` (68 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install eksctl.io`
 * @homepage https://eksctl.io
 * @dependencies `github.com/kubernetes-sigs/aws-iam-authenticator`
 * @buildDependencies `github.com/maxbrunsfeld/counterfeiter`, `go.dev@~1.25`, `github.com/vburenin/ifacemaker`, ... (+1 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.eksctlio
 * console.log(pkg.name)        // "eksctl"
 * console.log(pkg.description) // "Simple command-line tool for creating clusters ..."
 * console.log(pkg.programs)    // ["eksctl"]
 * console.log(pkg.versions[0]) // "0.221.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/eksctl-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const eksctlioPackage = {
  /**
   * The display name of this package.
   */
  name: 'eksctl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'eksctl.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Simple command-line tool for creating clusters on Amazon EKS' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/eksctl.io/package.yml' as const,
  homepageUrl: 'https://eksctl.io' as const,
  githubUrl: 'https://github.com/eksctl-io/eksctl' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install eksctl.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +eksctl.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install eksctl.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'eksctl',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'github.com/kubernetes-sigs/aws-iam-authenticator',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'github.com/maxbrunsfeld/counterfeiter',
    'go.dev@~1.25',
    'github.com/vburenin/ifacemaker',
    'vektra.github.io/mockery@^2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.221.0',
    '0.220.0',
    '0.219.0',
    '0.218.0',
    '0.217.0',
    '0.216.0',
    '0.215.0',
    '0.214.0',
    '0.213.0',
    '0.212.0',
    '0.211.0',
    '0.210.0',
    '0.209.0',
    '0.208.0',
    '0.207.0',
    '0.206.0',
    '0.205.0',
    '0.204.0',
    '0.203.0',
    '0.202.0',
    '0.201.0',
    '0.200.0',
    '0.199.0',
    '0.198.0',
    '0.197.0',
    '0.196.0',
    '0.195.0',
    '0.194.0',
    '0.193.0',
    '0.192.0',
    '0.191.0',
    '0.190.0',
    '0.189.0',
    '0.188.0',
    '0.187.0',
    '0.186.0',
    '0.185.0',
    '0.184.0',
    '0.183.0',
    '0.182.0',
    '0.181.0',
    '0.180.0',
    '0.179.0',
    '0.178.0',
    '0.177.0',
    '0.176.0',
    '0.175.0',
    '0.174.0',
    '0.173.0',
    '0.172.0',
    '0.171.0',
    '0.170.0',
    '0.169.0',
    '0.168.0',
    '0.167.0',
    '0.166.0',
    '0.165.0',
    '0.164.0',
    '0.163.0',
    '0.162.0',
    '0.161.0',
    '0.160.0',
    '0.159.0',
    '0.158.0',
    '0.157.0',
    '0.156.0',
    '0.155.0',
    '0.154.0',
  ] as const,
  aliases: [] as const,
}

export type EksctlioPackage = typeof eksctlioPackage
