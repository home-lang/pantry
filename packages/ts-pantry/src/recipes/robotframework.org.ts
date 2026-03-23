import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'robotframework.org',
  name: 'robot',
  description: 'Generic automation framework for acceptance testing and RPA',
  homepage: 'https://robotframework.org/',
  github: 'https://github.com/robotframework/robotframework',
  programs: ['robot'],
  versionSource: {
    type: 'github-releases',
    repo: 'robotframework/robotframework',
  },
  distributable: null,
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3',
    'rust-lang.org': '^1.56',
    'certifi.io/python-certifi': '*',
    'cryptography.io': '*',
    'libsodium.org': '*',
  },

  build: {
    script: [
      'pip download --no-deps --no-binary :all: --dest . robotframework=={{version.raw}}',
      'tar zxvf robotframework-{{version.raw}}.tar.gz --strip-components=1',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} robot',
    ],
  },
}
