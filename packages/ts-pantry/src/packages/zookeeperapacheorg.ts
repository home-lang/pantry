/**
 * **zookeeper** - Apache ZooKeeper distributed coordination service
 *
 * @domain `zookeeper.apache.org`
 * @programs `zkServer.sh`, `zkCli.sh`
 *
 * @install `pantry install zookeeper.apache.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.zookeeperapacheorg
 * console.log(pkg.name)        // "zookeeper"
 * console.log(pkg.programs)    // ["zkServer.sh", "zkCli.sh"]
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/zookeeper-apache-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const zookeeperapacheorgPackage = {
  name: 'zookeeper' as const,
  domain: 'zookeeper.apache.org' as const,
  description: 'Apache ZooKeeper distributed coordination service' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://zookeeper.apache.org' as const,
  githubUrl: 'https://github.com/apache/zookeeper' as const,
  installCommand: 'pantry install zookeeper.apache.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +zookeeper.apache.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install zookeeper.apache.org' as const,
  programs: [
    'zkServer.sh',
    'zkCli.sh',
  ] as const,
  companions: [] as const,
  dependencies: [
    'openjdk.org',
  ] as const,
  buildDependencies: [] as const,
  versions: [
    '3.9.3',
    '3.9.2',
    '3.9.1',
    '3.8.4',
  ] as const,
  aliases: [] as const,
}

export type ZookeeperapacheorgPackage = typeof zookeeperapacheorgPackage
