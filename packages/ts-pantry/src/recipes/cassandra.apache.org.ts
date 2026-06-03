import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cassandra.apache.org',
  name: 'cassandra',
  description: 'Apache Cassandra wide-column distributed database',
  homepage: 'https://cassandra.apache.org',
  github: 'apache/cassandra',
  programs: ['cassandra', 'nodetool', 'cqlsh'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/aarch64', 'linux/x86-64'],
  // Pure-JVM: one universal binary tarball for every platform; needs a JDK.
  dependencies: { 'openjdk.org': '*' },

  versionSource: {
    type: 'github-tags',
    repo: 'apache/cassandra',
    tagPattern: /^cassandra-(.+)$/,
  },
  distributable: null,

  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'curl -fSL "https://archive.apache.org/dist/cassandra/{{version}}/apache-cassandra-{{version}}-bin.tar.gz" -o cassandra.tar.gz',
      'mkdir -p {{prefix}}',
      'tar xzf cassandra.tar.gz --strip-components=1 -C {{prefix}}',
      'rm cassandra.tar.gz',
    ],
  },
}
