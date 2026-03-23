import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'epsilon-project.sourceforge.io',
  name: 'epsilon',
  description: 'Powerful wavelet image compressor',
  homepage: 'https://sourceforge.net/projects/epsilon-project/',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/epsilon-project/epsilon/{{version}}/epsilon-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'autoreconf --force --install --verbose',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'epsilon --version | grep {{version}}',
    ],
  },
}
