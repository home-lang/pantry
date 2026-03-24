import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pi.dev',
  name: 'pi',
  programs: ['pi', 'pi-init'],
  distributable: {
    url: 'https://registry.npmjs.org/@mariozechner/pi-coding-agent/-/pi-coding-agent-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '^20',
    'github.com/mikefarah/yq': '*',
    'stedolan.github.io/jq': '*',
    'gnu.org/sed': '*',
  },
  buildDependencies: {
    'nodejs.org': '^20',
    'npmjs.com': '*',
  },

  build: {
    script: [
      'npm i $ARGS .',
      'install -Dm755 props/pi-init {{prefix}}/bin/pi-init',
    ],
    env: {
      'ARGS': ['--global', '--prefix={{prefix}}', '--install-links', '--unsafe-perm'],
    },
  },
}
