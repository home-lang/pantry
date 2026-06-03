/**
 * **neo4j** - Neo4j graph database (community edition)
 *
 * @domain `neo4j.com`
 * @programs `neo4j`, `neo4j-admin`, `cypher-shell`
 *
 * @install `pantry install neo4j.com`
 *
 * @see https://ts-pantry.netlify.app/packages/neo4j-com.md
 */
export const neo4jcomPackage = {
  name: 'neo4j' as const,
  domain: 'neo4j.com' as const,
  description: 'Neo4j graph database (community edition)' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://neo4j.com' as const,
  githubUrl: 'https://github.com/neo4j/neo4j' as const,
  installCommand: 'pantry install neo4j.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +neo4j.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install neo4j.com' as const,
  programs: [
    'neo4j',
    'neo4j-admin',
    'cypher-shell',
  ] as const,
  companions: [] as const,
  dependencies: [
    'openjdk.org',
  ] as const,
  buildDependencies: [] as const,
  versions: [
    '5.26.0',
    '5.25.1',
    '5.24.0',
  ] as const,
  aliases: [] as const,
}

export type Neo4jcomPackage = typeof neo4jcomPackage
