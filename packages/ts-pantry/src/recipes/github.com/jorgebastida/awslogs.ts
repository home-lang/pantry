import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/jorgebastida/awslogs",
  name: "awslogs",
  programs: [
    "awslogs",
  ],
  dependencies: {
    'python.org': "^3.11",
    'github.com/benjaminp/six': "*",
    'zlib.net': "*",
  },
  buildDependencies: {
    linux: {
      'llvm.org': "*",
    },
  },
  distributable: {
    url: "https://github.com/jorgebastida/awslogs/archive/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i.bak 's|>=3.5.\\*|>=3.5|g' setup.py\nrm setup.py.bak\n",
      },
      "python-venv.sh {{prefix}}/bin/awslogs",
    ],
  },
  test: {
    script: [
      "awslogs --version | grep {{version}}",
    ],
  },
}
