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
    '6.0-alpha1',
    '5.0.8',
    '5.0.7',
    '5.0.6',
    '5.0.5',
    '5.0.4',
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0.0',
    '5.0-rc2',
    '5.0-rc1',
    '5.0-beta1',
    '5.0-alpha2',
    '5.0-alpha1',
    '4.1.11',
    '4.1.10',
    '4.1.9',
    '4.1.8',
    '4.1.7',
    '4.1.6',
    '4.1.5',
    '4.1.4',
    '4.1.3',
    '4.1.2',
    '4.1.1',
    '4.1.0',
    '4.1-rc1',
    '4.1-beta1',
    '4.1-alpha1',
    '4.0.20',
    '4.0.19',
    '4.0.18',
    '4.0.17',
    '4.0.16',
    '4.0.15',
    '4.0.14',
    '4.0.13',
    '4.0.12',
    '4.0.11',
    '4.0.10',
    '4.0.9',
    '4.0.8',
    '4.0.7',
    '4.0.6',
    '4.0.5',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
  ] as const,
  aliases: [] as const,
}

export type CassandraapacheorgPackage = typeof cassandraapacheorgPackage
