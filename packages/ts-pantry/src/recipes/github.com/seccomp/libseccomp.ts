import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/seccomp/libseccomp',
  platforms: ['linux'],
  name: 'libseccomp',
  programs: [
    'scmp_sys_resolver',
  ],
  buildDependencies: {
    'gnu.org/libtool': '*',
    'gnu.org/gperf': '*',
  },
  distributable: {
    url: 'https://github.com/seccomp/libseccomp/releases/download/{{version.tag}}/libseccomp-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}} --disable-silent-rules',
      'make install',
    ],
  },
  test: {
    script: [
      'scmp_sys_resolver 0',
      'cc $FIXTURE -lseccomp -o test',
      './test',
    ],
  },
}
