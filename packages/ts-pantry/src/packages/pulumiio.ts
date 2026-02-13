/**
 * **pulumi** - Pulumi - Infrastructure as Code in any programming language 🚀
 *
 * @domain `pulumi.io`
 * @programs `pulumi`, `pulumi-analyzer-policy`, `pulumi-analyzer-policy-python`, `pulumi-language-dotnet`, `pulumi-language-go`, ... (+8 more)
 * @version `3.216.0` (179 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pulumi.io`
 * @homepage https://pulumi.io/
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `go.dev@^1.20`, `classic.yarnpkg.com`, `nodejs.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pulumiio
 * console.log(pkg.name)        // "pulumi"
 * console.log(pkg.description) // "Pulumi - Infrastructure as Code in any programm..."
 * console.log(pkg.programs)    // ["pulumi", "pulumi-analyzer-policy", ...]
 * console.log(pkg.versions[0]) // "3.216.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pulumi-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pulumiioPackage = {
  /**
   * The display name of this package.
   */
  name: 'pulumi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pulumi.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Pulumi - Infrastructure as Code in any programming language 🚀' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pulumi.io/package.yml' as const,
  homepageUrl: 'https://pulumi.io/' as const,
  githubUrl: 'https://github.com/pulumi/pulumi' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pulumi.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pulumi.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pulumi.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pulumi',
    'pulumi-analyzer-policy',
    'pulumi-analyzer-policy-python',
    'pulumi-language-dotnet',
    'pulumi-language-go',
    'pulumi-language-java',
    'pulumi-language-nodejs',
    'pulumi-language-python',
    'pulumi-language-python-exec',
    'pulumi-language-yaml',
    'pulumi-resource-pulumi-nodejs',
    'pulumi-resource-pulumi-python',
    'pulumi-watch',
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
   */
  buildDependencies: [
    'go.dev@^1.20',
    'classic.yarnpkg.com',
    'nodejs.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.216.0',
    '3.215.0',
    '3.214.1',
    '3.214.0',
    '3.213.0',
    '3.212.0',
    '3.211.0',
    '3.210.0',
    '3.209.0',
    '3.208.0',
    '3.207.0',
    '3.206.0',
    '3.205.0',
    '3.204.0',
    '3.203.0',
    '3.202.0',
    '3.201.0',
    '3.200.0',
    '3.199.0',
    '3.198.0',
    '3.197.0',
    '3.196.0',
    '3.195.0',
    '3.194.0',
    '3.193.0',
    '3.192.0',
    '3.191.0',
    '3.190.0',
    '3.189.0',
    '3.188.0',
    '3.187.0',
    '3.186.0',
    '3.185.0',
    '3.184.0',
    '3.183.0',
    '3.182.0',
    '3.181.0',
    '3.180.0',
    '3.178.0',
    '3.177.0',
    '3.176.0',
    '3.175.0',
    '3.174.0',
    '3.173.0',
    '3.172.0',
    '3.171.0',
    '3.170.0',
    '3.169.0',
    '3.168.0',
    '3.167.0',
    '3.166.0',
    '3.165.0',
    '3.163.0',
    '3.162.0',
    '3.161.0',
    '3.158.0',
    '3.157.0',
    '3.156.0',
    '3.155.0',
    '3.154.0',
    '3.153.1',
    '3.153.0',
    '3.152.0',
    '3.151.0',
    '3.150.0',
    '3.149.0',
    '3.148.0',
    '3.147.0',
    '3.146.0',
    '3.145.0',
    '3.144.1',
    '3.144.0',
    '3.143.0',
    '3.142.0',
    '3.141.0',
    '3.140.0',
    '3.139.0',
    '3.138.0',
    '3.137.0',
    '3.136.1',
    '3.136.0',
    '3.135.1',
    '3.135.0',
    '3.134.1',
    '3.134.0',
    '3.133.0',
    '3.132.0',
    '3.131.0',
    '3.130.0',
    '3.129.0',
    '3.128.0',
    '3.127.0',
    '3.126.0',
    '3.125.0',
    '3.124.0',
    '3.123.0',
    '3.122.0',
    '3.121.0',
    '3.120.0',
    '3.119.0',
    '3.118.0',
    '3.117.0',
    '3.116.1',
    '3.116.0',
    '3.115.2',
    '3.115.1',
    '3.115.0',
    '3.114.0',
    '3.113.3',
    '3.113.2',
    '3.113.1',
    '3.113.0',
    '3.112.0',
    '3.111.1',
    '3.111.0',
    '3.110.0',
    '3.109.0',
    '3.108.1',
    '3.108.0',
    '3.107.0',
    '3.106.0',
    '3.105.0',
    '3.104.2',
    '3.104.1',
    '3.104.0',
    '3.103.1',
    '3.103.0',
    '3.102.0',
    '3.101.1',
    '3.101.0',
    '3.100.0',
    '3.99.0',
    '3.98.0',
    '3.97.0',
    '3.96.2',
    '3.96.1',
    '3.96.0',
    '3.95.0',
    '3.94.2',
    '3.94.1',
    '3.94.0',
    '3.93.0',
    '3.92.0',
    '3.91.1',
    '3.91.0',
    '3.90.1',
    '3.90.0',
    '3.89.0',
    '3.88.1',
    '3.88.0',
    '3.87.0',
    '3.86.0',
    '3.85.0',
    '3.84.0',
    '3.83.0',
    '3.82.1',
    '3.82.0',
    '3.81.0',
    '3.80.0',
    '3.79.0',
    '3.78.1',
    '3.78.0',
    '3.77.1',
    '3.77.0',
    '3.76.1',
    '3.76.0',
    '3.75.0',
    '3.74.0',
    '3.73.0',
    '3.72.2',
    '3.72.1',
    '3.72.0',
    '3.71.0',
    '3.70.0',
    '3.69.0',
    '3.68.0',
    '3.67.1',
    '3.67.0',
    '3.66.0',
  ] as const,
  aliases: [] as const,
}

export type PulumiioPackage = typeof pulumiioPackage
