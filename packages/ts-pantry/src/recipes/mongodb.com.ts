import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mongodb.com',
  name: 'mongodb',
  description: 'The MongoDB Database',
  homepage: 'https://www.mongodb.com/',
  github: 'https://github.com/mongodb/mongo',
  programs: ['install_compass', 'mongod', 'mongos'],
  versionSource: {
    type: 'github-releases',
    repo: 'mongodb/mongo/tags',
    tagPattern: /\/^r\//,
  },
  distributable: null,
  dependencies: {
    'curl.se': '8',
    'openssl.org': '1.1',
  },

  build: {
    script: [
      'curl -L "$DIST" | tar xzf - --strip-components=1',
      'mkdir -p "{{prefix}}/bin"',
      'cp -a bin/* "{{prefix}}/bin"',
    ],
  },
}
