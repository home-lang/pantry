import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'glfw.org',
  name: 'glfw',
  description: 'A multi-platform library for OpenGL, OpenGL ES, Vulkan, window and input',
  homepage: 'https://www.glfw.org',
  github: 'https://github.com/glfw/glfw',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'glfw/glfw',
  },
  distributable: {
    url: 'git+https://github.com/glfw/glfw.git',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake $ARGS .',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DGLFW_USE_CHDIR=TRUE', '-DGLFW_USE_MENUBAR=TRUE', '-DBUILD_SHARED_LIBS=TRUE'],
    },
  },
}
