import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gource.io',
  name: 'gource',
  description: 'software version control visualization',
  homepage: 'https://gource.io',
  github: 'https://github.com/acaudwell/Gource',
  programs: ['gource'],
  platforms: ['darwin/aarch64'],
  versionSource: {
    type: 'github-releases',
    repo: 'acaudwell/Gource',
    tagPattern: /^gource-(.+)$/,
  },
  distributable: {
    url: 'https://github.com/acaudwell/Gource/releases/download/{{version.tag}}/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'boost.org': '^1.82',
    'freetype.org': '^2',
    'libpng.org': '^1.6',
    'pcre.org/v2': '^10',
    'libsdl.org': '^2',
    'glew.sourceforge.io': '^2',
    'libsdl.org/SDL_image': '^2',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'glm.g-truc.net': '^0',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--without-x', '--with-boost={{deps.boost.org.prefix}}'],
      'CXXFLAGS': '-std=c++17',
      'CXX': 'clang++',
      'CC': 'clang',
    },
  },
}
