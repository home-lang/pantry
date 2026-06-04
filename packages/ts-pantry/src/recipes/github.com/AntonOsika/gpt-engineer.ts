import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/AntonOsika/gpt-engineer",
  propsDir: '../../props/github.com/AntonOsika/gpt-engineer',
  name: "gpt-engineer",
  programs: [
    "gpte",
    "gpt-engineer",
  ],
  dependencies: {
    'pkgx.sh': ">=1",
  },
  buildDependencies: {
    'python.org': "~3.11",
    'python-poetry.org': "^1.7",
  },
  distributable: {
    url: "https://github.com/AntonOsika/gpt-engineer/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "patch -p1 < props/main.py.patch",
        if: "=0.0.3",
      },
      {
        run: "bkpyvenv stage --engine=poetry {{prefix}} {{version}}\npoetry lock\npoetry install\nbkpyvenv seal --engine=poetry {{prefix}} gpte gpt-engineer",
        if: ">=0.2.6",
      },
      {
        run: "bkpyvenv stage --engine=poetry {{prefix}} {{version}}\npoetry install --with=experimental\nbkpyvenv seal --engine=poetry {{prefix}} gpte gpt-engineer",
        if: ">=0.2.1<0.2.6",
      },
      {
        run: "bkpyvenv stage {{prefix}} {{version}}\n${{prefix}}/venv/bin/pip install .\nbkpyvenv seal {{prefix}} gpte gpt-engineer",
        if: "<0.2.1",
      },
      {
        run: "cp -a identity {{prefix}}",
        if: "=0.0.3",
      },
    ],
  },
  test: {
    script: [
      "gpte --help",
      "gpt-engineer --help",
    ],
  },
}
