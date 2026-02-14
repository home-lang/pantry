/**
 * **cdk** - The AWS Cloud Development Kit is a framework for defining cloud infrastructure in code
 *
 * @domain `aws.amazon.com/cdk`
 * @programs `cdk`
 * @version `3.0.0` (177 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install aws.amazon.com/cdk`
 * @name `aws/cdk`
 * @aliases `cdk`
 * @homepage https://aws.amazon.com/cdk
 * @dependencies `nodejs.org`
 * @buildDependencies `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.cdk
 * // Or access via domain
 * const samePkg = pantry.awsamazoncomcdk
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "aws/cdk"
 * console.log(pkg.description) // "The AWS Cloud Development Kit is a framework fo..."
 * console.log(pkg.programs)    // ["cdk"]
 * console.log(pkg.versions[0]) // "3.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/aws-amazon-com/cdk.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cdkPackage = {
  /**
  * The display name of this package.
  */
  name: 'aws/cdk' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'aws.amazon.com/cdk' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The AWS Cloud Development Kit is a framework for defining cloud infrastructure in code' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/aws.amazon.com/cdk/package.yml' as const,
  homepageUrl: 'https://aws.amazon.com/cdk' as const,
  githubUrl: 'https://github.com/aws/aws-cdk' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install aws.amazon.com/cdk' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +aws.amazon.com/cdk -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install aws.amazon.com/cdk' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cdk',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'npmjs.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.0.0',
    '2.1029.2',
    '2.1029.1',
    '2.1029.0',
    '2.1028.0',
    '2.1027.0',
    '2.1026.0',
    '2.1025.0',
    '2.1024.0',
    '2.1023.0',
    '2.1022.0',
    '2.1021.0',
    '2.1020.2',
    '2.1020.1',
    '2.1020.0',
    '2.1019.2',
    '2.1019.1',
    '2.1019.0',
    '2.1018.1',
    '2.1018.0',
    '2.1017.1',
    '2.1017.0',
    '2.1016.1',
    '2.1016.0',
    '2.1015.0',
    '2.1014.0',
    '2.1013.0',
    '2.1012.0',
    '2.1011.0',
    '2.1010.0',
    '2.1009.0',
    '2.1008.0',
    '2.1007.0',
    '2.1006.0',
    '2.1005.0',
    '2.1004.0',
    '2.1003.0',
    '2.1002.0',
    '2.1001.0',
    '2.1000.3',
    '2.1000.2',
    '2.1000.1',
    '2.1000.0',
    '2.179.0',
    '2.178.2',
    '2.178.1',
    '2.178.0',
    '2.177.0',
    '2.176.0',
    '2.175.1',
    '2.175.0',
    '2.174.1',
    '2.174.0',
    '2.173.4',
    '2.173.3',
    '2.173.2',
    '2.173.1',
    '2.173.0',
    '2.172.0',
    '2.171.1',
    '2.171.0',
    '2.170.0',
    '2.169.0',
    '2.168.0',
    '2.167.2',
    '2.167.1',
    '2.167.0',
    '2.166.0',
    '2.165.0',
    '2.164.1',
    '2.164.0',
    '2.163.1',
    '2.163.0',
    '2.162.1',
    '2.162.0',
    '2.161.1',
    '2.161.0',
    '2.160.0',
    '2.159.1',
    '2.159.0',
    '2.158.0',
    '2.157.0',
    '2.156.0',
    '2.155.0',
    '2.154.1',
    '2.154.0',
    '2.153.0',
    '2.152.0',
    '2.151.1',
    '2.151.0',
    '2.150.0',
    '2.149.0',
    '2.148.1',
    '2.148.0',
    '2.147.3',
    '2.147.2',
    '2.147.1',
    '2.147.0',
    '2.146.0',
    '2.145.0',
    '2.144.0',
    '2.143.1',
    '2.143.0',
    '2.142.1',
    '2.142.0',
    '2.141.0',
    '2.140.0',
    '2.139.1',
    '2.139.0',
    '2.138.0',
    '2.137.0',
    '2.136.1',
    '2.136.0',
    '2.135.0',
    '2.134.0',
    '2.133.0',
    '2.132.1',
    '2.132.0',
    '2.131.0',
    '2.130.0',
    '2.129.0',
    '2.128.0',
    '2.127.0',
    '2.126.0',
    '2.125.0',
    '2.124.0',
    '2.123.0',
    '2.122.0',
    '2.121.1',
    '2.121.0',
    '2.120.0',
    '2.119.0',
    '2.118.0',
    '2.117.0',
    '2.116.1',
    '2.116.0',
    '2.115.0',
    '2.114.1',
    '2.114.0',
    '2.113.0',
    '2.112.0',
    '2.111.0',
    '2.110.1',
    '2.110.0',
    '2.109.0',
    '2.108.1',
    '2.108.0',
    '2.107.0',
    '2.106.1',
    '2.106.0',
    '2.105.0',
    '2.104.0',
    '2.103.1',
    '2.103.0',
    '2.102.1',
    '2.102.0',
    '2.101.1',
    '2.101.0',
    '2.100.0',
    '2.99.1',
    '2.99.0',
    '2.98.0',
    '2.97.1',
    '2.97.0',
    '2.96.2',
    '2.96.1',
    '2.96.0',
    '2.95.1',
    '2.95.0',
    '2.94.0',
    '2.93.0',
    '2.92.0',
    '2.91.0',
    '2.90.0',
    '2.89.0',
    '2.88.0',
    '2.87.0',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'cdk',
  ] as const,
}

export type CdkPackage = typeof cdkPackage
