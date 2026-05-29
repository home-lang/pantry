import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mandoc.bsd.lv',
  name: 'mandoc.bsd.lv',
  description: 'UNIX manpage compiler toolset',
  homepage: 'https://mandoc.bsd.lv/',
  programs: ['bsdapropos', 'bsdman', 'bsdsoelim', 'bsdwhatis', 'demandoc', 'mandoc'],
  distributable: {
    url: 'https://mandoc.bsd.lv/snapshots/mandoc-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
  },

  build: {
    script: [
      // For man.cgi
      'mv cgi.h.example cgi.h',
      {
        run: 'cat $PROP >configure.local',
        prop: {
          content: [
            'PREFIX={{prefix}}',
            'INCLUDEDIR={{prefix}}/include',
            'LIBDIR={{prefix}}/lib',
            'MANDIR={{prefix}}/share/man',
            'WWWPREFIX={{prefix}}/var/www',
            'EXAMPLEDIR={{prefix}}/share/examples',
            'BINM_MAN=bsdman',
            'BINM_APROPOS=bsdapropos',
            'BINM_WHATIS=bsdwhatis',
            'BINM_MAKEWHATIS=bsdmakewhatis',
            'BINM_SOELIM=bsdsoelim',
            'MANM_MAN=man',
            'MANM_MDOC=mdoc',
            'MANM_ROFF=mandoc_roff',
            'MANM_EQN=eqn',
            'MANM_TBL=tbl',
            'OSNAME=$(uname -a)',
            'MANPATH_DEFAULT={{prefix}}/share/man',
            'HAVE_MANPATH=0',
            'STATIC=',
            'BUILD_CGI=1',
            '',
          ].join('\n'),
        },
      },
      './configure',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
