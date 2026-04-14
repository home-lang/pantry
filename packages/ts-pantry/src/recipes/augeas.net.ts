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
  },

  build: {
    script: [
      'curl -L https://github.com/hercules-team/augeas/commit/7b26cbb74ed634d886ed842e3d5495361d8fd9b1.patch?full_index=1 | patch -p1',
      'autoreconf --force --install',
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'CFLAGS': '-Wno-implicit-function-declaration',
      'ARGS': ['--prefix="{{prefix}}"', '--disable-debug', '--disable-dependency-tracking'],
    },
  },
}
