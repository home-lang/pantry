import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pkgx.sh/pkgm',
  name: 'pkgm',
  programs: [
    'pkgm',
  ],
  dependencies: {
    'pkgx.sh': '^2',
    'curl.se/ca-certs': '*',
  },
  distributable: {
    url: 'https://github.com/pkgxdev/pkgm/releases/download/{{ version.tag }}/pkgm-{{ version }}.tgz',
  },
  build: {
    script: [
      'install -Dm755 pkgm {{prefix}}/bin/pkgm',
    ],
  },
  test: {
    script: [
      'pkgm --version | grep {{version}}',
      'exit 0',
      'pkgm install dua',
      'pkgm local-install dua',
      'pkgm ls | grep dua',
      'PATH=/usr/local/bin:$HOME/.local/bin:$PATH command -v dua',
      'PATH=/usr/local/bin:$HOME/.local/bin:$PATH dua --version',
      'pkgm uninstall dua',
    ],
  },
}
