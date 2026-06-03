import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'neo4j.com',
  name: 'neo4j',
  description: 'Neo4j graph database (community edition)',
  homepage: 'https://neo4j.com',
  github: 'neo4j/neo4j',
  programs: ['neo4j', 'neo4j-admin', 'cypher-shell'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/aarch64', 'linux/x86-64'],
  // Pure-JVM: one universal "unix" tarball for every platform; needs a JDK.
  dependencies: { 'openjdk.org': '*' },

  versionSource: {
    type: 'github-tags',
    repo: 'neo4j/neo4j',
    tagPattern: /^(\d+\.\d+\.\d+)$/,
  },
  distributable: null,

  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'curl -fSL "https://dist.neo4j.org/neo4j-community-{{version}}-unix.tar.gz" -o neo4j.tar.gz',
      'mkdir -p {{prefix}}',
      'tar xzf neo4j.tar.gz --strip-components=1 -C {{prefix}}',
      'rm neo4j.tar.gz',
    ],
  },
}
