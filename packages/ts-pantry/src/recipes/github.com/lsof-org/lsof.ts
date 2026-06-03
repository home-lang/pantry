import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/lsof-org/lsof',
  name: 'lsof',
  programs: [
    'lsof',
  ],
  buildDependencies: {
    'gnu.org/coreutils': '*',
    'gnu.org/make': '*',
    'llvm.org': '*',
    linux: {
      'gnu.org/binutils': '*',
    },
  },
  distributable: {
    url: 'https://github.com/lsof-org/lsof/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './Configure -n {{ hw.platform }}',
      'make --jobs {{ hw.concurrency }}',
      'install -d {{prefix}}/bin',
      'install -m 755 lsof {{prefix}}/bin/lsof',
    ],
  },
}
