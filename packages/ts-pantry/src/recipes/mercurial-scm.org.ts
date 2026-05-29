import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mercurial-scm.org',
  name: 'mercurial-scm',
  description: 'Scalable distributed version control system',
  homepage: 'https://mercurial-scm.org/',
  programs: ['hg', 'chg'],
  dependencies: {
    'python.org': '~3.13', // as of 7.1
  },
  buildDependencies: {
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://www.mercurial-scm.org/release/mercurial-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      {
        run: [
          'python -m venv ~/.venv',
          'source ~/.venv/bin/activate',
          'pip install setuptools_scm wheel',
        ],
      },
      'make install-bin PREFIX={{prefix}}',
      'make -C contrib/chg install PREFIX={{prefix}} HGPATH={{prefix}}/bin/hg HG={{prefix}}/bin/hg',
      {
        run: 'cat $PROP >hgrc',
        'working-directory': '{{prefix}}/etc/mercurial',
        prop: {
          content: [
            '[pager]',
            'pager = less -FRX',
            '',
          ].join('\n'),
        },
      },
      {
        run: [
          'mkdir -p {{prefix}}/share/man/man{1,5}',
          'install hg.1 {{prefix}}/share/man/man1/',
          'install hgignore.5 hgrc.5 {{prefix}}/share/man/man5/',
        ],
        'working-directory': 'doc',
      },
      {
        run: 'sed -i \'1s|.*|#!/usr/bin/env python3|\' hg',
        'working-directory': '{{prefix}}/bin',
      },
    ],
    env: {
      HGPYTHON3: '1',
    },
  },
}
