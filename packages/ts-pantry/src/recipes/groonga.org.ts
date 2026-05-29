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
    'darwin': {
      'taku910.github.io/mecab': '*',
      'taku910.github.io/mecab-ipadic': '*',
    },
    'linux/x86-64': {
      'taku910.github.io/mecab': '*',
      'taku910.github.io/mecab-ipadic': '*',
    },
    'linux': {
      'gnome.org/glib': '*',
    },
  },
  buildDependencies: {
    linux: {
      'curl.se': '*',
    },
  },

  build: {
    script: [
      {
        run: [
          '../configure $CONFIGURE_ARGS',
          'make --jobs {{hw.concurrency}} install',
        ],
        'working-directory': 'builddir',
      },
      'curl -L "$LINK" | tar zxf -',
      {
        run: [
          'export PATH={{prefix}}/bin:$PATH',
          'export PKG_CONFIG_PATH={{prefix}}/lib/pkgconfig:$PKG_CONFIG_PATH',
          './configure --prefix={{prefix}}',
          'make --jobs {{hw.concurrency}}',
          'make --jobs {{hw.concurrency}} install',
        ],
        'working-directory': 'groonga-normalizer-mysql-1.2.1',
      },
      {
        run: 'if test -d groonga; then mv groonga/* .; rmdir groonga; fi',
        'working-directory': '{{prefix}}/include/groonga',
      },
    ],
    env: {
      'CONFIGURE_ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--disable-zeromq', '--disable-apache-arrow', '--with-luajit=no', '--with-ssl', '--with-zlib', '--without-libstemmer'],
      'LINK': 'https://packages.groonga.org/source/groonga-normalizer-mysql/groonga-normalizer-mysql-1.2.1.tar.gz',
      'darwin': {
        'CONFIGURE_ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--disable-zeromq', '--disable-apache-arrow', '--with-luajit=no', '--with-ssl', '--with-zlib', '--without-libstemmer', '--with-mecab'],
      },
      'linux/x86-64': {
        'CONFIGURE_ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--disable-zeromq', '--disable-apache-arrow', '--with-luajit=no', '--with-ssl', '--with-zlib', '--without-libstemmer', '--with-mecab'],
      },
    },
  },
}
