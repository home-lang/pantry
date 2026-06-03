import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/nat/openplayground",
  name: "openplayground",
  programs: [
    "openplayground",
  ],
  dependencies: {
    'python.org': "~3.11",
    'gnu.org/bash': "*",
    'tea.xyz': "^0",
  },
  buildDependencies: {
    'npmjs.com': "*",
    'python-poetry.org': "~1.4.1",
    'pip.pypa.io': "*",
  },
  distributable: {
    url: "https://github.com/nat/openplayground/archive/7f3f790.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "python-venv.py {{prefix}}/bin/openplayground",
      {
        run: "npm i\nnpx parcel build src/index.html --no-cache --no-source-maps\n",
        'working-directory': "app",
      },
      "mv app/dist {{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages/server/static",
      "cp props/entrypoint.sh {{prefix}}",
    ],
  },
  test: {
    script: [
      "openplayground --help",
    ],
  },
}
