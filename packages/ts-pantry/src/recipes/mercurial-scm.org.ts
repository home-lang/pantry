import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'mercurial-scm.org',
  name: 'mercurial-scm',
  description: 'Scalable distributed version control system',
  homepage: 'https://mercurial-scm.org/',
  programs: [],
  distributable: {
    url: 'https://www.mercurial-scm.org/release/mercurial-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'run:',
      'make install-bin PREFIX={{prefix}}',
      'make -C contrib/chg install PREFIX={{prefix}} HGPATH={{prefix}}/bin/hg HG={{prefix}}/bin/hg',
      'run: cat $PROP >hgrc',
      'run:',
      'run: sed -i \\1s|.*|#!/usr/bin/env python3|\\ hg',
    ],
  },
}
