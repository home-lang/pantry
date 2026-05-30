import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/git-scm.org',
  domain: 'git-scm.org',
  name: 'git',
  description: 'Git Source Code Mirror - This is a publish-only repository but pull requests can be turned into patches to the mailing list via GitGitGadget (https://gitgitgadget.github.io/). Please follow Documentation/SubmittingPatches procedure for any of your improvements.',
  github: 'https://github.com/git/git',
  programs: ['git', 'git-cvsserver', 'git-receive-pack', 'git-shell', 'git-upload-archive', 'git-upload-pack', 'scalar', 'git-credential-osxkeychain'],
  dependencies: {
    'zlib.net': '1',
    'curl.se': '>=5',
    'curl.se/ca-certs': '*',
    'perl.org': '*',
    'libexpat.github.io': '~2',
    linux: {
      'gnu.org/gettext': '^0.21',
      'gnu.org/libiconv': '*',
    },
  },
  versionSource: {
    type: 'github-releases',
    repo: 'git/git',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://mirrors.edge.kernel.org/pub/software/scm/git/git-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'mv props/config.mak .',

      [
        './configure',
        '--prefix={{prefix}}',
        '--with-perl={{deps.perl.org.prefix}}/bin/perl',
        '--with-gitconfig=etc/gitconfig',
      ].join(' '),

      'make install --jobs {{hw.concurrency}} NO_TCLTK=1',

      {
        run: [
          'make',
          'make install',
        ],
        'working-directory': 'contrib/subtree',
      },

      {
        run: [
          'make CFLAGS="-g -O2 -Wall -I../../.." LDFLAGS="$LDFLAGS -lz -liconv"',
          'install -Dm755 git-credential-osxkeychain "{{prefix}}"/bin',
          'make clean',
        ],
        'working-directory': 'contrib/credential/osxkeychain',
        if: 'darwin',
      },

      {
        run: 'mv git-subtree "{{prefix}}"/libexec',
        'working-directory': 'contrib/subtree',
      },

      {
        run: 'fix-shebangs.ts bin/* libexec/*',
        'working-directory': '{{prefix}}',
      },

      {
        run: 'cp "$SRCROOT"/props/gitconfig "$SRCROOT"/props/gitignore .',
        'working-directory': '{{prefix}}/etc',
      },

      {
        run: [
          'rm bin/git',
          'cp $SRCROOT/props/git-shim bin/git',
        ],
        'working-directory': '{{prefix}}',
      },
    ],
    env: {
      V: '1',
      INSTALL_STRIP: '-s',
    },
  },
}
