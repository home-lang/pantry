import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'debian.org/bash-completion',
  name: 'bash-completion',
  programs: [],
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'http://deb.debian.org/debian/pool/main/b/bash-completion/bash-completion_{{version.raw}}.orig.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'autoreconf -i',
      './configure --prefix={{prefix}}',
      'make',
      'make install',
    ],
  },
  test: {
    script: [
      'bash -c ". {{prefix}}/etc/profile.d/bash_completion.sh"',
    ],
  },
}
