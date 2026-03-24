import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'glm.g-truc.net',
  name: 'glm.g-truc',
  description: 'OpenGL Mathematics (GLM)',
  homepage: 'https://glm.g-truc.net',
  github: 'https://github.com/g-truc/glm',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'g-truc/glm',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/g-truc/glm/releases/download/{{version.tag}}/glm-{{version.tag}}.zip',
  },

  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build -- all',
      'mkdir -p {{prefix}}/include {{prefix}}/lib/pkgconfig',
      'cp -a detail ext gtc gtx simd *.hpp \\{{prefix}}/include\\',
      'run: ln -s . glm',
      'run: c++ $FIXTURE',
      './a.out',
    ],
  },
}
