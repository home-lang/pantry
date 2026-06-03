/**
 * **solr** - Apache Solr enterprise search platform
 *
 * @domain `solr.apache.org`
 * @programs `solr`
 *
 * @install `pantry install solr.apache.org`
 *
 * @see https://ts-pantry.netlify.app/packages/solr-apache-org.md
 */
export const solrapacheorgPackage = {
  name: 'solr' as const,
  domain: 'solr.apache.org' as const,
  description: 'Apache Solr enterprise search platform' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://solr.apache.org' as const,
  githubUrl: 'https://github.com/apache/solr' as const,
  installCommand: 'pantry install solr.apache.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +solr.apache.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install solr.apache.org' as const,
  programs: [
    'solr',
  ] as const,
  companions: [] as const,
  dependencies: [
    'openjdk.org',
  ] as const,
  buildDependencies: [] as const,
  versions: [
    '9.8.1',
    '9.8.0',
    '9.7.0',
  ] as const,
  aliases: [] as const,
}

export type SolrapacheorgPackage = typeof solrapacheorgPackage
