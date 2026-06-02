import type { Recipe } from '../../../scripts/recipe-types'

// Faithful port of pkgx's gnu.org/gettext package.yml.
export const recipe: Recipe = {
  domain: 'gnu.org/gettext',
  name: 'gettext',
  description: 'GNU internationalization (i18n) and localization (l10n) library',
  homepage: 'https://www.gnu.org/software/gettext/',
  github: 'https://github.com/autotools-mirror/gettext',
  programs: [
    'autopoint',
    'envsubst',
    'gettext',
    'gettext.sh',
    'gettextize',
    'msgattrib',
    'msgcat',
    'msgcmp',
    'msgcomm',
    'msgconv',
    'msgen',
    'msgexec',
    'msgfilter',
    'msgfmt',
    'msggrep',
    'msginit',
    'msgmerge',
    'msgunfmt',
    'msguniq',
    'ngettext',
    'recode-sr-latin',
    'xgettext',
  ],
  dependencies: {
    'gnome.org/libxml2': '~2.13', // 2.14 changes the API
    'tukaani.org/xz': '^5', // autopoint needs this to unpack archives
  },
  buildDependencies: {
    'perl.org': '~5.42', // needs to match the minor texinfo uses.
    darwin: {
      'gnu.org/libiconv': '*', // as of v1.0.0
    },
  },
  versionSource: {
    type: 'github-tags',
    repo: 'autotools-mirror/gettext',
    // tags are v1.0, v0.26, v0.22.5 — strip the leading "v" so {{version.raw}}
    // matches the FTP tarball names (gettext-1.0.tar.gz, gettext-0.26.tar.gz).
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/gettext/gettext-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      // try to prevent iconv contamination on darwin
      {
        run: [
          'cp -a {{deps.gnu.org/libiconv.prefix}}/include .',
          'mkdir -p lib',
          'cp {{deps.gnu.org/libiconv.prefix}}/lib/*.a lib/',
        ],
        if: 'darwin',
        'working-directory': 'iconv-static',
      },

      './configure $ARGS',

      // skip docs/examples as bloat
      {
        run: [
          'cat $PROP >gettext-runtime/doc/Makefile',
          'cat $PROP >gettext-tools/doc/Makefile',
          'cat $PROP >gettext-tools/examples/Makefile',
        ],
        prop: { content: 'all install:\n' },
      },

      'make --jobs {{hw.concurrency}} $MAKE_ARGS',
      'make install',

      {
        run: 'sed -i.bak \'s|{{prefix}}|"$(cd "$(dirname "$0")/.." && pwd)"|\' gettextize autopoint && rm -f gettextize.bak autopoint.bak',
        'working-directory': '{{prefix}}/bin',
      },

      // ensure we haven't created a dynamic dependency on gnu's libiconv
      {
        run: [
          'otool -L libintl.dylib *.dylib | (grep libiconv.dylib || true) | tee out',
          // make sure there's no results
          'test -f out && ! test -s out',
        ],
        if: 'darwin',
        'working-directory': '{{prefix}}/lib',
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--with-included-debug',
        '--with-included-libcroco',
        '--with-included-libunistring',
        '--without-included-libxml',
        '--disable-java',
        '--disable-csharp',
      ],
      darwin: {
        ARGS: [
          '--with-libiconv-prefix=$SRCROOT/iconv-static',
        ],
      },
    },
  },

  test: {
    script: [
      'test "$(echo hello | envsubst)" = "hello"',
      'msgfmt --version',
      'xgettext --version',
    ],
  },
}
