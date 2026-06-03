import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/pantoniou/libfyaml',
  name: 'libfyaml',
  programs: [
    'fy-compose',
    'fy-dump',
    'fy-filter',
    'fy-join',
    'fy-testsuite',
    'fy-tool',
    'fy-ypath',
  ],
  dependencies: {
    linux: {
      'llvm.org': 22,
    },
  },
  buildDependencies: {
    linux: {
      'gnu.org/m4': '*',
    },
  },
  distributable: {
    url: 'https://github.com/pantoniou/libfyaml/releases/download/{{version.tag}}/libfyaml-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS --prefix="{{prefix}}"',
      'make --jobs {{ hw.concurrency }} install',
      {
        run: 'sed -i \'s/\\*__ptr/\\*(_ptr)/g\' {{prefix}}/include/libfyaml/libfyaml-atomics.h',
        if: '=0.9.6',
      },
    ],
  },
  test: {
    script: [
      'c++ $FIXTURE -o test -lfyaml',
      'test "$(./test)" = "{{version}}" || test "$(./test)" = "{{version.marketing}}"',
      'test "$(fy-tool --version)" = "{{version}}" || test "$(fy-tool --version)" = "{{version.marketing}}"',
    ],
  },
}
