import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'augeas.net',
  name: 'augeas',
  description: 'A configuration editing tool and API',
  homepage: 'https://augeas.net/',
  github: 'https://github.com/hercules-team/augeas',
  programs: ['augmatch', 'augparse', 'augprint', 'augtool', 'fadot'],
  versionSource: {
    type: 'github-releases',
    repo: 'hercules-team/augeas',
    tagPattern: /^release-(.+)$/,
  },
  distributable: {
    url: 'https://github.com/hercules-team/augeas/releases/download/release-{{version}}/augeas-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/readline': '*',
    'gnome.org/libxml2': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/bison': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
    'curl.se': '*',
    'gnu.org/patch': '*',
    'linux': {
      'gnu.org/gcc': '*',
    },
  },

  build: {
    script: [
      {
        run: 'curl -L https://github.com/hercules-team/augeas/commit/7b26cbb74ed634d886ed842e3d5495361d8fd9b1.patch?full_index=1 | patch -p1',
        if: '<1.14.1',
      },
      // The release tarball ships a working autotools `configure` (plus
      // aclocal.m4/Makefile.in). pkgx ran `autoreconf --force --install`, but
      // forcing a full autotools regen against the box's libtool/gnulib macros
      // is what caused the historical "libtool/autoconf" build failures — the
      // vendored macros don't match the CI host's autotools. Use the shipped
      // configure directly (only the source patch above is needed).
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'CFLAGS': '-Wno-implicit-function-declaration',
      'ARGS': ['--prefix={{prefix}}', '--disable-debug', '--disable-dependency-tracking'],
    },
  },
}
