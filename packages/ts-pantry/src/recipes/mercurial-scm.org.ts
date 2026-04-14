import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mercurial-scm.org',
  name: 'mercurial-scm',
  description: 'Scalable distributed version control system',
  homepage: 'https://mercurial-scm.org/',
  programs: ['hg', 'chg'],
  distributable: {
    url: 'https://www.mercurial-scm.org/release/mercurial-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'make install-bin PREFIX={{prefix}}',
      'make -C contrib/chg install PREFIX={{prefix}} HGPATH={{prefix}}/bin/hg HG={{prefix}}/bin/hg',
    ],
  },
}
