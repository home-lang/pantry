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
    // v1.0.0+ ships only a "-light" zip; the plain glm-<tag>.zip 404s for those
    // releases. The light archive still extracts to a `glm/` subdir with the
    // CMakeLists + headers the build below expects.
    url: 'https://github.com/g-truc/glm/releases/download/{{version.tag}}/glm-{{version.tag}}-light.zip',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    workingDirectory: 'glm',
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build -- all',
      'mkdir -p {{prefix}}/include {{prefix}}/lib/pkgconfig',
      'cp -a detail ext gtc gtx simd *.hpp \'{{prefix}}/include\'',
      {
        run: 'ln -s . glm',
        'working-directory': '{{prefix}}/include',
      },
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-DBUILD_SHARED_LIBS=ON',
      ],
      CXXFLAGS: [
        '-std=c++17',
        // or fails to build with clang 15
        '-Wno-error=implicit-int-conversion',
        '-Wno-error=unused-but-set-variable',
        '-Wno-error=deprecated-declarations',
      ],
      'linux': {
        CXXFLAGS: [
          '-Wno-error=implicit-int-float-conversion',
        ],
      },
      'linux/x86-64': {
        CXXFLAGS: [
          '-fPIC',
        ],
      },
    },
  },
}
