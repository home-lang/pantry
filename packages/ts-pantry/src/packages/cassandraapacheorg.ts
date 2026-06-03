/**
 * **cassandra** - Apache Cassandra wide-column distributed database
 *
 * @domain `cassandra.apache.org`
 * @programs `cassandra`, `nodetool`, `cqlsh`
 *
 * @install `pantry install cassandra.apache.org`
 *
 * @see https://ts-pantry.netlify.app/packages/cassandra-apache-org.md
 */
export const cassandraapacheorgPackage = {
  name: 'cassandra' as const,
  domain: 'cassandra.apache.org' as const,
  description: 'Apache Cassandra wide-column distributed database' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://cassandra.apache.org' as const,
  githubUrl: 'https://github.com/apache/cassandra' as const,
  installCommand: 'pantry install cassandra.apache.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cassandra.apache.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install cassandra.apache.org' as const,
  programs: [
    'cassandra',
    'nodetool',
    'cqlsh',
  ] as const,
  companions: [] as const,
  dependencies: [
    'openjdk.org',
  ] as const,
  buildDependencies: [] as const,
  versions: [
    '5.0.3',
    '5.0.2',
    '4.1.7',
    '4.1.6',
  ] as const,
  aliases: [] as const,
}

export type CassandraapacheorgPackage = typeof cassandraapacheorgPackage
