import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'glew.sourceforge.io',
  name: 'glew.sourceforge',
  description: 'The OpenGL Extension Wrangler Library',
  homepage: 'https://glew.sourceforge.net/',
  github: 'https://github.com/nigels-com/glew',
  programs: ['glewinfo', 'visualinfo'],
  platforms: ['darwin/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'nigels-com/glew',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://downloads.sourceforge.net/project/glew/glew/{{version}}/glew-{{version}}.tgz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake ../build/cmake -DCMAKE_INSTALL_PREFIX="{{prefix}}" -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
  },
}
