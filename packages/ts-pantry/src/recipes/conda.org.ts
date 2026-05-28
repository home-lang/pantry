import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/conda.org',
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
      {
        run: [
          'for v in 9 8 7 6 5 4 3 2 1 0; do',
          '  if curl -fLS https://repo.anaconda.com/miniconda/Miniconda3-py311_{{version}}-$v-${SUFFIX}.sh -o miniconda.sh; then',
          '    break',
          '  fi',
          'done',
          'test -f miniconda.sh',
        ].join('\n'),
      },
      'chmod +x miniconda.sh',
      './miniconda.sh -b -f -s -p {{prefix}}/venv',

      // stops conda from installing to our versioned prefix by default
      {
        run: [
          'cd conda-{{version}}-*/lib/python3.11/site-packages',
          'patch -p1 < $SRCROOT/props/context.py.diff',
        ].join('\n'),
        'working-directory': '{{prefix}}/venv/pkgs',
      },
      {
        run: 'patch -p1 < $SRCROOT/props/context.py.diff',
        'working-directory': '{{prefix}}/venv/lib/python3.11/site-packages',
      },

      'bkpyvenv seal {{prefix}} conda',

      // we desire to provide a conda that doesn’t require you to force it into
      // your shellrc this command modifies the installation to prevent it
      // erroring so we have to do prior to pkging it
      '{{prefix}}/bin/conda init',

      // put the conda libs in a findable path
      {
        run: 'ln -s venv/lib lib',
        'working-directory': '{{prefix}}',
      },
    ],
    env: {
      'darwin/aarch64': {
        SUFFIX: 'MacOSX-arm64',
      },
      'darwin/x86-64': {
        SUFFIX: 'MacOSX-x86_64',
      },
      'linux/x86-64': {
        SUFFIX: 'Linux-x86_64',
      },
      'linux/aarch64': {
        SUFFIX: 'Linux-aarch64',
      },
    },
  },
}
