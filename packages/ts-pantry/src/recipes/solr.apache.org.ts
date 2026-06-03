import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'solr.apache.org',
  name: 'solr',
  description: 'Apache Solr enterprise search platform',
  homepage: 'https://solr.apache.org',
  github: 'apache/solr',
  programs: ['solr'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/aarch64', 'linux/x86-64'],
  // Pure-JVM: one universal binary tarball for every platform; needs a JDK.
  dependencies: { 'openjdk.org': '*' },

  versionSource: {
    type: 'github-tags',
    repo: 'apache/solr',
    tagPattern: /^releases\/solr\/(.+)$/,
  },
  distributable: null,

  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'curl -fSL "https://archive.apache.org/dist/solr/solr/{{version}}/solr-{{version}}.tgz" -o solr.tgz',
      'mkdir -p "{{prefix}}"',
      'tar xzf solr.tgz --strip-components=1 -C "{{prefix}}"',
      'rm solr.tgz',
    ],
  },
}
