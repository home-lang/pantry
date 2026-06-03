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
    repo: 'mongodb/mongo',
    tagPattern: /^r(.+)$/,
  },
  distributable: null,
  dependencies: {
    'curl.se': '8',
    'openssl.org': '1.1',
  },

  build: {
    script: [
      'curl -L "$DIST" | tar xzf - --strip-components=1',
      'mkdir -p {{prefix}}/bin',
      'cp -a bin/* {{prefix}}/bin',
    ],
    env: {
      'darwin/aarch64': {
        DIST: 'https://fastdl.mongodb.org/osx/mongodb-macos-arm64-{{version}}.tgz',
      },
      'darwin/x86-64': {
        DIST: 'https://fastdl.mongodb.org/osx/mongodb-macos-x86_64-{{version}}.tgz',
      },
      'linux/aarch64': {
        DIST: 'https://fastdl.mongodb.org/linux/mongodb-linux-aarch64-ubuntu2004-{{version}}.tgz',
      },
      'linux/x86-64': {
        DIST: 'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2004-{{version}}.tgz',
      },
    },
  },
}
