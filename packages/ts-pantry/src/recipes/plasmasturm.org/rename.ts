import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'plasmasturm.org/rename',
  name: 'rename',
  programs: [
    'rename',
  ],
  dependencies: {
    'perl.org': '>=5',
  },
  distributable: {
    url: 'https://github.com/ap/rename/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'pod2man rename rename.1',
      'mkdir -p {{ prefix }}/bin',
      'mv rename {{ prefix }}/bin',
      'mkdir -p {{ prefix }}/share/man/man1',
      'mv rename.1 {{ prefix }}/share/man/man1',
    ],
  },
  test: {
    script: [
      'touch foo.txt',
      'rename -s .txt .md foo.txt',
      'ls foo.md',
    ],
  },
}
