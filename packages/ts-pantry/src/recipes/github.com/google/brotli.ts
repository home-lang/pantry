import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/google/brotli',
  name: 'brotli',
  programs: [
    'brotli',
  ],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/google/brotli/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX={{prefix}}',
      'make --jobs={{ hw.concurrency }}',
      'make install',
    ],
  },
  test: {
    script: [
      'brotli $FIXTURE $FIXTURE.br',
      'brotli $FIXTURE.br --output=out.txt --decompress',
      'test "$(cat $FIXTURE)" = "$(cat out.txt)"',
    ],
  },
}
