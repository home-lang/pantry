import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'zookeeper.apache.org',
  name: 'zookeeper',
  description: 'Apache ZooKeeper distributed coordination service',
  homepage: 'https://zookeeper.apache.org',
  github: 'apache/zookeeper',
  programs: ['zkServer.sh', 'zkCli.sh'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'linux/aarch64', 'linux/x86-64'],
  // Pure-JVM: one universal binary tarball for every platform; needs a JDK.
  dependencies: { 'openjdk.org': '*' },

  versionSource: {
    type: 'github-tags',
    repo: 'apache/zookeeper',
    tagPattern: /^release-(.+)$/,
  },
  distributable: null,

  build: {
    skip: ['fix-machos', 'fix-patchelf'],
    script: [
      'curl -fSL "https://archive.apache.org/dist/zookeeper/zookeeper-{{version}}/apache-zookeeper-{{version}}-bin.tar.gz" -o zk.tar.gz',
      'mkdir -p {{prefix}}',
      'tar xzf zk.tar.gz --strip-components=1 -C {{prefix}}',
      'rm zk.tar.gz',
    ],
  },
}
