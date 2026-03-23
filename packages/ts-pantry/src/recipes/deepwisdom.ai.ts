import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'deepwisdom.ai',
  name: 'MetaGPT',
  description: '🌟 The Multi-Agent Framework: First AI Software Company, Towards Natural Language Programming',
  homepage: 'https://deepwisdom.ai/',
  github: 'https://github.com/geekan/MetaGPT',
  programs: ['metagpt'],
  versionSource: {
    type: 'github-releases',
    repo: 'geekan/MetaGPT',
  },
  distributable: {
    url: 'https://github.com/geekan/MetaGPT/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
    'git-scm.org': '^2',
  },
  buildDependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} metagpt',
    ],
  },
}
