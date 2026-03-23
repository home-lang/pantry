import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'valkey.io',
  name: 'valkey',
  description: 'A flexible distributed key-value datastore that is optimized for caching and other realtime workloads.',
  homepage: 'https://valkey.io',
  github: 'https://github.com/valkey-io/valkey',
  programs: ['valkey-server', 'valkey-cli', 'valkey-benchmark'],
  versionSource: {
    type: 'github-releases',
    repo: 'valkey-io/valkey',
  },
  distributable: {
    url: 'https://github.com/valkey-io/valkey/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1',
  },

  build: {
    script: [
      'make install',
    ],
    env: {
      'PREFIX': '${{prefix}}',
      'BUILD_TLS': 'yes',
    },
  },
}
