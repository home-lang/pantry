import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/asciidoc-py/asciidoc-py',
  name: 'asciidoc-py',
  programs: [
    'asciidoc',
  ],
  dependencies: {
    'docbook.org': '*',
    'python.org': '~3.11',
    'gnu.org/source-highlight': '*',
  },
  distributable: {
    url: 'https://github.com/asciidoc-py/asciidoc-py/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/asciidoc',
    ],
  },
  test: {
    script: [
      'echo \'Hello World!\' > text.txt asciidoc -b html5 -o test.html test.txt test $(cat test.html) = \'<h2 id="_hello_world">Hello World!</h2>\'',
    ],
  },
}
