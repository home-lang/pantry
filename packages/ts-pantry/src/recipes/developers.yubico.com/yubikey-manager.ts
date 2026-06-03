import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'developers.yubico.com/yubikey-manager',
  name: 'yubikey-manager',
  programs: [
    'ykman',
  ],
  dependencies: {
    'python.org': '~3.11',
    linux: {
      'pcsclite.apdu.fr': '^2',
    },
  },
  buildDependencies: {
    'pip.pypa.io': '*',
    'swig.org': '*',
  },
  distributable: {
    url: 'https://github.com/Yubico/yubikey-manager/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/ykman',
    ],
  },
}
