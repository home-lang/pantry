import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/k0sproject/k0sctl',
  name: 'k0sctl',
  programs: [
    'k0sctl',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/k0sproject/k0sctl/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make k0sctl TAG_NAME={{version.tag}}',
      'install -D k0sctl {{prefix}}/bin/k0sctl',
    ],
  },
  test: {
    script: [
      'k0sctl version 2>&1 | grep {{version}}',
      'k0sctl init root@10.0.0.1 2>&1 | grep \'k0s-cluster\'',
    ],
  },
}
