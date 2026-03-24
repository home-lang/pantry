import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libspng.org',
  name: 'libspng',
  description: 'Simple, modern libpng alternative',
  homepage: 'https://libspng.org',
  github: 'https://github.com/randy408/libspng',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'randy408/libspng',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/randy408/libspng/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'ninja-build.org': '1',
    'freedesktop.org/pkg-config': '*',
    'mesonbuild.com': '*',
  },

  build: {
    script: [
      'meson .. --prefix={{prefix}} --libdir={{prefix}}/lib --buildtype=release',
      'ninja -v',
      'ninja install -v',
      '',
    ],
  },
}
