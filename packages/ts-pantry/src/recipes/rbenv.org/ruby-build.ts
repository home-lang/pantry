import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rbenv.org/ruby-build',
  name: 'ruby-build',
  programs: [
    'ruby-build',
  ],
  dependencies: {
    'openssl.org': '>=1.1',
    'curl.se': '*',
    'gnu.org/autoconf': '^2.72',
    'freedesktop.org/pkg-config': '*',
    'gnu.org/readline': '^8.2',
    'pyyaml.org/libyaml': '^0.2',
  },
  distributable: {
    url: 'git+https://github.com/rbenv/ruby-build.git',
  },
  build: {
    script: [
      'make install PREFIX={{prefix}}',
    ],
  },
  test: {
    script: [
      'ruby-build --version | grep {{version.raw}}',
      'ruby-build 2.7.8 $PWD/ruby-2.7.8 --verbose',
      'ruby --version | grep \'2.7.8\'',
      'ruby-build --help',
    ],
  },
}
