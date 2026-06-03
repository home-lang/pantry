import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'riverbankcomputing.com/sip',
  name: 'sip',
  programs: [
    'sip-install',
    'sip-build',
    'sip-distinfo',
    'sip-module',
    'sip-sdist',
    'sip-wheel',
  ],
  dependencies: {
    'python.org': '~3.11',
    'llvm.org': '<17',
  },
  buildDependencies: {
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://www.riverbankcomputing.com/hg/sip/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/sip-install',
      'python-venv.sh {{prefix}}/bin/sip-build',
      'python-venv.sh {{prefix}}/bin/sip-distinfo',
      'python-venv.sh {{prefix}}/bin/sip-module',
      'python-venv.sh {{prefix}}/bin/sip-sdist',
      'python-venv.sh {{prefix}}/bin/sip-wheel',
    ],
    env: {
      linux: {
        CC: 'clang',
        AS: 'llvm-as',
      },
    },
  },
  test: {
    script: [
      'sip-install --target-dir .',
    ],
  },
}
