import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'riverbankcomputing.com/pyqt-builder',
  name: 'pyqt-builder',
  programs: [
    'pyqt-bundle',
  ],
  dependencies: {
    'python.org': '~3.11',
    'riverbankcomputing.com/sip': '*',
  },
  buildDependencies: {
    'llvm.org': '<17',
    'gnu.org/make': '*',
  },
  distributable: {
    url: 'https://www.riverbankcomputing.com/hg/PyQt-builder/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/pyqt-bundle',
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
      'pyqt-bundle -V',
      'python3 -c "import pyqtbuild"',
    ],
  },
}
