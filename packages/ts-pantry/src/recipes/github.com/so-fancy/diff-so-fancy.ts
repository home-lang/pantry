import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/so-fancy/diff-so-fancy',
  name: 'diff-so-fancy',
  programs: [
    'diff-so-fancy',
  ],
  dependencies: {
    'perl.org': 5,
  },
  distributable: {
    url: 'https://github.com/so-fancy/diff-so-fancy/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin',
      // diff-so-fancy locates its lib/ via dirname(abs_path($0))."/lib",
      // so the script and lib/ must stay siblings.
      'install -Dm755 diff-so-fancy {{prefix}}/bin/diff-so-fancy',
      'cp -a lib {{prefix}}/bin/lib',
    ],
  },
}
