import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libpng.org',
  name: 'libpng',
  description: 'LIBPNG: Portable Network Graphics support, official libpng repository',
  homepage: 'http://www.libpng.org/pub/png/libpng.html',
  github: 'https://github.com/glennrp/libpng',
  programs: ['libpng-config', 'libpng16-config', 'png-fix-itxt', 'pngfix'],
  versionSource: {
    type: 'github-releases',
    repo: 'glennrp/libpng',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/libpng/libpng{{version.major}}{{version.minor}}/{{version}}/libpng-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      'echo "Build not yet configured for libpng.org"',    ],
  },
}
