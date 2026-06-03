import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microsoft.com/azure-cli',
  name: 'azure-cli',
  programs: [
    'az',
  ],
  dependencies: {
    'openssl.org': 1.1,
    'python.org': '>=3.10<3.12',
    'sourceware.org/libffi': '*',
  },
  buildDependencies: {
    'rust-lang.org': '*',
    linux: {
      'freedesktop.org/pkg-config': '*',
    },
  },
  distributable: {
    url: 'https://github.com/Azure/azure-cli/archive/refs/tags/azure-cli-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '_SRCROOT="$SRCROOT"',
      'for venv in azure-cli{-telemetry,-core,}; do',
      '  SRCROOT="$_SRCROOT"/src/"$venv" python-venv.sh {{prefix}}/bin/az',
      'done',
    ],
    env: {
      CC: 'clang',
      LD: 'clang',
    },
  },
  test: {
    script: [
      'az cloud show --name AzureCloud',
    ],
  },
}
