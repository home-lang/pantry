import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'harding.motd.ca/autossh',
  name: 'autossh',
  programs: [
    'autossh',
  ],
  dependencies: {
    'openssh.com': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'gnu.org/gcc': '*',
  },
  distributable: {
    url: 'git+https://github.com/Autossh/autossh',
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make -j {{hw.concurrency}} PREFIX={{prefix}}',
      'make install PREFIX={{prefix}}',
    ],
  },
}
