/**
 * **casdoor** - pkgx package
 *
 * @domain `casdoor.org`
 * @version `2.257.0` (104 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install casdoor.org`
 * @buildDependencies `go.dev@^1.21`, `nodejs.org@18.19.0`, `classic.yarnpkg.com@^1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.casdoororg
 * console.log(pkg.name)        // "casdoor"
 * console.log(pkg.versions[0]) // "2.257.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/casdoor-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const casdoororgPackage = {
  /**
   * The display name of this package.
   */
  name: 'casdoor' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'casdoor.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/casdoor.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install casdoor.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +casdoor.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install casdoor.org' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
    'nodejs.org@18.19.0',
    'classic.yarnpkg.com@^1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.257.0',
    '2.256.0',
    '2.255.1',
    '2.255.0',
    '2.254.0',
    '2.253.0',
    '2.252.0',
    '2.251.0',
    '2.250.0',
    '2.249.0',
    '2.248.0',
    '2.247.0',
    '2.246.1',
    '2.246.0',
    '2.245.1',
    '2.245.0',
    '2.244.0',
    '2.243.0',
    '2.242.0',
    '2.241.0',
    '2.240.0',
    '2.239.0',
    '2.238.0',
    '2.237.0',
    '2.236.0',
    '2.235.0',
    '2.234.1',
    '2.234.0',
    '2.233.0',
    '2.232.0',
    '2.231.0',
    '2.230.0',
    '2.229.0',
    '2.228.0',
    '2.227.0',
    '2.226.0',
    '2.225.0',
    '2.223.0',
    '2.222.0',
    '2.221.0',
    '2.220.0',
    '2.219.0',
    '2.218.0',
    '2.217.0',
    '2.216.0',
    '2.215.0',
    '2.214.0',
    '2.213.0',
    '2.212.0',
    '2.211.0',
    '2.210.0',
    '2.209.1',
    '2.209.0',
    '2.208.0',
    '2.207.0',
    '2.206.0',
    '2.205.0',
    '2.204.0',
    '2.203.0',
    '2.202.0',
    '2.201.0',
    '2.200.0',
    '2.199.0',
    '2.198.0',
    '2.197.0',
    '2.196.1',
    '2.196.0',
    '2.195.1',
    '2.195.0',
    '2.194.0',
    '2.193.0',
    '2.192.0',
    '2.191.0',
    '2.190.1',
    '2.190.0',
    '2.189.0',
    '2.188.0',
    '2.187.0',
    '2.186.0',
    '2.185.0',
    '2.184.0',
    '2.183.0',
    '2.182.1',
    '2.182.0',
    '2.181.0',
    '2.180.0',
    '2.179.0',
    '2.178.1',
    '2.178.0',
    '2.177.0',
    '2.176.0',
    '2.175.0',
    '2.174.1',
    '2.174.0',
    '2.173.3',
    '2.173.2',
    '2.173.1',
    '2.173.0',
    '2.172.0',
    '2.171.0',
    '2.170.0',
    '2.169.0',
    '2.168.0',
    '2.167.0',
  ] as const,
  aliases: [] as const,
}

export type CasdoororgPackage = typeof casdoororgPackage
