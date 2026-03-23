import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'redis.io',
  name: 'redis',
  description: 'Redis is an in-memory database that persists on disk. The data model is key-value, but many different kind of values are supported: Strings, Lists, Sets, Sorted Sets, Hashes, Streams, HyperLogLogs, Bitmaps.',
  homepage: 'http://redis.io',
  github: 'https://github.com/redis/redis',
  programs: ['redis-server', 'redis-cli', 'redis-benchmark'],
  versionSource: {
    type: 'github-releases',
    repo: 'redis/redis',
  },
  distributable: {
    url: 'https://download.redis.io/releases/redis-{{ version }}.tar.gz',
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
