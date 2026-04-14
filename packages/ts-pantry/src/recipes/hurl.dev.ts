import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'hurl.dev',
  name: 'hurl',
  description: 'Run and Test HTTP Requests with plain text and curl',
  homepage: 'https://hurl.dev',
  github: 'https://github.com/Orange-OpenSource/hurl',
  programs: ['hurl', 'hurlfmt'],
  versionSource: {
    type: 'github-releases',
    repo: 'Orange-OpenSource/hurl',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/Orange-OpenSource/hurl/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnome.org/libxml2': '~2.13',
    'curl.se': '*',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      'cargo install --locked --path packages/hurl --root {{prefix}}',
      'cargo install --locked --path packages/hurlfmt --root {{prefix}}',
    ],
  },
}
