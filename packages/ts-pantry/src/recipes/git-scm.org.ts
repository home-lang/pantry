import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/git-scm.org',
  domain: 'git-scm.org',
  name: 'git',
  description: 'Git Source Code Mirror - This is a publish-only repository but pull requests can be turned into patches to the mailing list via GitGitGadget (https://gitgitgadget.github.io/). Please follow Documentation/SubmittingPatches procedure for any of your improvements.',
  github: 'https://github.com/git/git',
  programs: ['git', 'git-cvsserver', 'git-receive-pack', 'git-shell', 'git-upload-archive', 'git-upload-pack', 'scalar'],
  platformPrograms: { darwin: ['git-credential-osxkeychain'] },
  dependencies: {
    'zlib.net': '1',
    'curl.se': '>=5',
    'curl.se/ca-certs': '*',
    'perl.org': '*',
    'libexpat.github.io': '~2',
    'gnu.org/gettext': '^0.21',
    linux: {
      'gnu.org/libiconv': '*',
    },
  },
  versionSource: {
    type: 'github-tags',
    repo: 'git/git',
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
          'make CFLAGS="$CFLAGS -g -O2 -Wall -I../../.." LDFLAGS="$LDFLAGS -lz -liconv -lintl"',
          'install -Dm755 git-credential-osxkeychain {{prefix}}/bin',
          'make clean',
        ],
        'working-directory': 'contrib/credential/osxkeychain',
        if: 'darwin',
      },

      {
        run: 'mv git-subtree {{prefix}}/libexec',
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
          'install -m755 "$SRCROOT/props/git-shim" bin/git',
        ],
        'working-directory': '{{prefix}}',
      },
    ],
    env: {
      V: '1',
      INSTALL_STRIP: '-s',
    },
  },
  test: {
    required: true,
    script: [
      // Build dependencies have temporary paths. Reproduce the installation
      // layout before checking Linux's loader without the build environment.
      `if [ "$(uname -s)" = Linux ]; then
        runtime="$(mktemp -d)"
        trap 'rm -rf "$runtime"' EXIT
        mkdir -p "$runtime/git-scm.org/v{{version}}"
        cp -a "{{prefix}}/." "$runtime/git-scm.org/v{{version}}/"
        IFS=: read -r -a runtime_libs <<< "\${LD_LIBRARY_PATH:-}"
        index=0
        for lib in "\${runtime_libs[@]}"; do
          [ -d "$lib" ] || continue
          index=$((index + 1))
          mkdir -p "$runtime/dependencies/library-$index/v1"
          ln -s "$lib" "$runtime/dependencies/library-$index/v1/lib"
        done
        mkdir -p "$runtime/gnu.org/gettext/v{{deps.gnu.org/gettext.version}}"
        ln -s "{{deps.gnu.org/gettext.prefix}}/bin" "$runtime/gnu.org/gettext/v{{deps.gnu.org/gettext.version}}/bin"
        env -u LD_LIBRARY_PATH "$runtime/git-scm.org/v{{version}}/bin/git" --version
        env -u LD_LIBRARY_PATH "$runtime/git-scm.org/v{{version}}/bin/git" init "$runtime/repo"
        env -u LD_LIBRARY_PATH "$runtime/git-scm.org/v{{version}}/bin/git" -C "$runtime/repo" submodule foreach --recursive true
      else
        "{{prefix}}/bin/git" --version
      fi`,
    ],
  },
}
