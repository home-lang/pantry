import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/sivel/speedtest-cli',
  name: 'speedtest-cli',
  programs: [
    'speedtest-cli',
    'speedtest',
  ],
  dependencies: {
    'python.org': '>=3.7<3.12',
  },
  distributable: {
    url: 'https://github.com/sivel/speedtest-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/speedtest-cli',
      {
        run: 'ln -s speedtest-cli speedtest',
        'working-directory': '${{prefix}}/bin',
      },
    ],
  },
}
