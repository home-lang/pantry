import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'nx.dev',
  name: 'nx.dev',
  programs: ['nx'],
  distributable: {
    url: 'https://registry.npmjs.org/nx/-/nx-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '*',
  },
  buildDependencies: {
    'nodejs.org': '18',
    'npmjs.com': '^10',
  },

  build: {
    script: [
      'export TMPDIR=/tmp/nx-build-tmp-$$',
      'mkdir -p "$TMPDIR"',
      'export npm_config_cache=/tmp/nx-npm-cache-$$',
      'mkdir -p "$npm_config_cache"',
      'npm cache clean --force 2>/dev/null || true',
      'npm i $ARGS .',
    ],
    env: {
      'ARGS': ['--global', '--install-links', '--prefix={{prefix}}', '--legacy-peer-deps'],
    },
  },
}
