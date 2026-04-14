import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'groonga.org',
  name: 'groonga',
  description: 'An embeddable fulltext search engine. Groonga is the successor project to Senna.',
  homepage: 'https://groonga.org/',
  github: 'https://github.com/groonga/groonga',
  programs: ['groonga', 'groonga-suggest-create-dataset'],
  versionSource: {
    type: 'github-releases',
    repo: 'groonga/groonga',
  },
  distributable: {
    url: 'https://github.com/groonga/groonga/releases/download/v{{version}}/groonga-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'msgpack.org': '*',
    'openssl.org': '*',
    'pcre.org/v2': '*',
    'github.com/besser82/libxcrypt': '*',
  },

  build: {
    script: [
      'cd "builddir"',
      '../configure $CONFIGURE_ARGS',
      'make --jobs {{hw.concurrency}} install',
      'curl -L "$LINK" | tar zxf -',
      'cd "groonga-normalizer-mysql-1.2.1"',
      'export PATH={{prefix}}/bin:$PATH',
      'export PKG_CONFIG_PATH={{prefix}}/lib/pkgconfig:$PKG_CONFIG_PATH',
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} install',
      'cd "${{prefix}}/include/groonga"',
      'if test -d groonga; then mv groonga/* .; rmdir groonga; fi',
    ],
    env: {
      'CONFIGURE_ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix="{{prefix}}"', '--libdir="{{prefix}}/lib"', '--disable-zeromq', '--disable-apache-arrow', '--with-luajit=no', '--with-ssl', '--with-zlib', '--without-libstemmer'],
      'LINK': 'https://packages.groonga.org/source/groonga-normalizer-mysql/groonga-normalizer-mysql-1.2.1.tar.gz',
    },
  },
}
