import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'bytebase.com',
  name: 'bytebase',
  description: 'World\\',
  homepage: 'https://www.bytebase.com',
  github: 'https://github.com/bytebase/bytebase',
  programs: ['bytebase'],
  platforms: ['linux', 'darwin/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'bytebase/bytebase',
  },
  distributable: {
    url: 'git+https://github.com/bytebase/bytebase.git',
  },
  dependencies: {
    'nodejs.org': '~24.1',
  },
  buildDependencies: {
    'go.dev': '~1.24.2',
    'pnpm.io': '*',
    'git-scm.org': '^2',
  },

  build: {
    script: [
      'cd "scripts"',
      'sed -i \'s/-ldflags "/-ldflags "-buildmode=pie /\' build_bytebase.sh',
      'cd "scripts"',
      'sed -i "s/^VERSION=\'.*\'$/VERSION=\'{{version}}\'/" build_init.sh',
      './scripts/build_bytebase.sh {{prefix}}/bin',
    ],
  },
}
