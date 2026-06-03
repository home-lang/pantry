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
      {
        run: 'sed -i -f $PROP diff-so-fancy',
      },
      'mkdir -p {{prefix}}/bin',
      'install -Dm755 diff-so-fancy {{prefix}}/bin',
      'cp -a lib {{prefix}}',
    ],
  },
}
