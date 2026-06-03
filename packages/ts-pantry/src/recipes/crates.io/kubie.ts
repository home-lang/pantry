import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/kubie',
  name: 'kubie',
  programs: [
    'kubie',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/sbstp/kubie/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'cp $FIXTURE kubie-test.yaml',
      '(kubie exec kubie-test kubie-test-namespace kubectl get pod 2>&1 || true) | tee out',
      'grep "The connection to the server 0.0.0.0 was refused - did you specify the right host or port?" out',
    ],
  },
}
