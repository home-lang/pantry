import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jonas.github.io/tig',
  name: 'tig',
  programs: [
    'tig',
  ],
  dependencies: {
    'gnu.org/libiconv': '^1',
    'invisible-island.net/ncurses': '^6',
  },
  buildDependencies: {
    // tig's `configure` hard-errors with "pkg-config not found" — it uses
    // pkg-config to locate ncursesw. pkgx's base build env provides it
    // implicitly, but native recipes must declare it explicitly.
    'freedesktop.org/pkg-config': '*',
  },
  versionSource: {
    // tig tags releases as `tig-X.Y.Z`; strip the `tig-` prefix to get the version.
    type: 'github-releases',
    repo: 'jonas/tig',
    tagPattern: /^tig-(.+)$/,
  },
  distributable: {
    // Release assets are uploaded under the full `tig-X.Y.Z` tag and named
    // `tig-X.Y.Z.tar.gz` — NOT `v{{version}}`. The auto-converted `{{version.tag}}`
    // heuristic guessed `v2.5.10`, which 404s. Pin the real `tig-`-prefixed name.
    url: 'https://github.com/jonas/tig/releases/download/tig-{{version}}/tig-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make prefix={{prefix}}',
      'make prefix={{prefix}} install',
    ],
  },
}
