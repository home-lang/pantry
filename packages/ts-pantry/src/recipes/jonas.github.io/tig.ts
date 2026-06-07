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
  distributable: {
    url: 'https://github.com/jonas/tig/releases/download/{{version.tag}}/{{version.tag}}.tar.gz',
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
