import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/fishshell.com',
  domain: 'fishshell.com',
  name: 'fish',
  description: 'User-friendly command-line shell for UNIX-like operating systems',
  homepage: 'https://fishshell.com',
  github: 'https://github.com/fish-shell/fish-shell',
  programs: ['fish', 'fish_indent', 'fish_key_reader'],
  versionSource: {
    type: 'github-releases',
    repo: 'fish-shell/fish-shell',
  },
  distributable: {
    url: 'https://github.com/fish-shell/fish-shell/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/gettext': '*',
    'invisible-island.net/ncurses': '>=6.0',
  },
  buildDependencies: {
    // fish 4.x was rewritten in Rust: it now builds Cargo crates via cmake
    // (corrosion), so Rust/cargo are required at build time. fish 4.x needs
    // Rust >= 1.85; cmake >= 3.15. Older ranges kept loose for 3.x source.
    'cmake.org': '>=3.15',
    'freedesktop.org/pkg-config': '*',
    'gnu.org/patch': '*',
    'git-scm.org': '^2',
    'rust-lang.org': '>=1.85',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      // By default, fish's fish_command_not_found handler will redirect to stderr,
      // return an exit code of 127. Always. This patch fixes it. Hopefully, it will
      // be merged upstream soon. https://github.com/fish-shell/fish-shell/pull/9517
      // Only applies to the fish 3.x source tree.
      {
        run: 'patch -p1 <props/command_not_found_handler.diff',
        if: '^3',
      },
      'echo {{version}} >version',
      // The cmake configure/build/install steps run from an out-of-source
      // `build/` directory; buildkit does not create the working-directory
      // for us, so create it explicitly before cmake runs.
      'mkdir -p build',
      // fish 4.x build: cmake configures + drives Cargo (corrosion), then
      // cmake --build / cmake --install. `make install` no longer works
      // because the Rust build is not a plain Makefile target.
      {
        run: [
          'cmake .. $ARGS',
          'cmake --build .',
          'cmake --install .',
        ].join('\n'),
        'working-directory': 'build',
      },
      {
        run: 'sed -i -e "s| $PKGX_DIR/| \\$PKGX_DIR/|g" __fish_build_paths.fish',
        'working-directory': '{{prefix}}/share/fish',
      },
    ],
    env: {
      'ARGS': [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
      ],
    },
  },
}
