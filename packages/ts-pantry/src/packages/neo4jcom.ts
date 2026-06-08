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
    '2026.05.0',
    '2026.04.0',
    '2026.03.1',
    '2026.02.3',
    '2026.02.2',
    '2026.01.4',
    '2026.01.3',
    '2025.12.1',
    '2025.11.2',
    '2025.10.1',
    '2025.09.0',
    '2025.08.0',
    '2025.07.1',
    '2025.07.0',
    '2025.06.2',
    '2025.06.1',
    '2025.06.0',
    '2025.05.1',
    '2025.05.0',
    '2025.04.0',
    '2025.03.0',
    '2025.02.0',
    '2025.01.0',
    '5.26.27',
    '5.26.26',
    '5.26.25',
    '5.26.24',
    '5.26.23',
    '5.26.22',
    '5.26.21',
    '5.26.20',
    '5.26.19',
    '5.26.18',
    '5.26.17',
    '5.26.16',
    '5.26.15',
    '5.26.14',
    '5.26.13',
    '5.26.12',
    '5.26.11',
    '5.26.10',
    '5.26.9',
    '5.26.8',
    '5.26.7',
    '5.26.6',
    '5.26.5',
    '5.26.4',
    '5.26.3',
    '5.26.2',
    '5.26.1',
    '5.26.0',
    '5.25.1',
    '5.24.0',
  ] as const,
  aliases: [] as const,
}

export type Neo4jcomPackage = typeof neo4jcomPackage
