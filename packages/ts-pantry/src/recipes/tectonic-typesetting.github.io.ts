import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'tectonic-typesetting.github.io',
  name: 'tectonic',
  description: 'A modernized, complete, self-contained TeX/LaTeX engine, powered by XeTeX and TeXLive.',
  homepage: 'https://tectonic-typesetting.github.io/',
  github: 'https://github.com/tectonic-typesetting/tectonic',
  programs: ['tectonic'],
  versionSource: {
    type: 'github-releases',
    repo: 'tectonic-typesetting/tectonic',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/tectonic-typesetting/tectonic/archive/refs/tags/tectonic@{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for tectonic-typesetting.github.io"',    ],
  },
}
