import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tcpdump.org',
  name: 'pcap-config',
  description: 'the LIBpcap interface to various kernel packet capture mechanism',
  homepage: 'https://www.tcpdump.org/',
  github: 'https://github.com/the-tcpdump-group/libpcap',
  programs: ['pcap-config'],
  versionSource: {
    type: 'github-releases',
    repo: 'the-tcpdump-group/libpcap',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://www.tcpdump.org/release/libpcap-{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'gnu.org/bison': '*',
    'github.com/westes/flex': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--enable-ipv6', '--disable-universal'],
    },
  },
}
