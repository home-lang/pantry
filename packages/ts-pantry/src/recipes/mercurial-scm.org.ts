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
    // Upstream drops the trailing ".0" for major.minor releases: 7.2.0 ships as
    // mercurial-7.2.tar.gz (a 3-part 7.2.0 URL 404s). version.marketing yields
    // major.minor, which matches the latest release we build.
    url: 'https://www.mercurial-scm.org/release/mercurial-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      {
        run: [
          'python -m venv ~/.venv',
          'source ~/.venv/bin/activate',
          // Setuptools>=77 requires packaging>=24.2 for license-expression
          // validation; install it so `make install-bin` doesn't fail.
          'pip install "packaging>=24.2" setuptools_scm wheel',
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
