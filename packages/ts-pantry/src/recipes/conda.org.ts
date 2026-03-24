import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'conda.org',
  name: 'conda',
  programs: ['conda'],
  dependencies: {
    'pkgx.sh': '>=1',
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'python.org': '=3.11.5',
    'gnu.org/patch': '*',
    'curl.se': '*',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      'for v in 9 8 7 6 5 4 3 2 1 0; do',
      '  if curl -fLS https://repo.anaconda.com/miniconda/Miniconda3-py311_{{version}}-$v-${SUFFIX}.sh -o miniconda.sh; then',
      '    break',
      '  fi',
      'done',
      'test -f miniconda.sh',
      '',
      'chmod +x miniconda.sh',
      './miniconda.sh -b -f -s -p {{prefix}}/venv',
      'cd "${{prefix}}/venv/pkgs"',
      'cd conda-{{version}}-*/lib/python3.11/site-packages',
      'patch -p1 < $SRCROOT/props/context.py.diff',
      '',
      'cd "${{prefix}}/venv/lib/python3.11/site-packages"',
      'patch -p1 < $SRCROOT/props/context.py.diff',
      'bkpyvenv seal {{prefix}} conda',
      '{{prefix}}/bin/conda init',
      'cd "${{prefix}}"',
      'ln -s venv/lib lib',
    ],
  },
}
