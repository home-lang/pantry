import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freetype.org',
  name: 'freetype',
  programs: [],
  distributable: {
    url: 'https://download.savannah.gnu.org/releases/freetype/freetype-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libpng.org': '1',
    'zlib.net': '1',
    'sourceware.org/bzip2': '1',
    'github.com/google/brotli': '1',
  },
  // Upstream binary archives carry private snapshots of PNG/Brotli/zlib.
  // Publish FreeType's products, then resolve those declared runtimes once.
  publish: { include: ['bin/freetype-config', 'include/**', 'lib/libfreetype*', 'lib/pkgconfig/freetype2.pc', 'lib/cmake/**', 'share/**'] },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'cmake.org': '*',
  },

  build: {
    'working-directory': 'build',
    workingDirectory: 'build',
    script: [
      'cmake .. $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['-DBUILD_SHARED_LIBS=true', '-DFT_REQUIRE_BROTLI=ON', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release'],
    },
  },
}
