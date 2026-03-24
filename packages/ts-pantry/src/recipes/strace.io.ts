import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'strace.io',
  name: 'strace',
  description: 'strace is a diagnostic, debugging and instructional userspace utility for Linux',
  homepage: 'https://strace.io/',
  github: 'https://github.com/strace/strace',
  programs: ['strace'],
  platforms: ['linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'strace/strace/releases/tags',
  },
  distributable: {
    url: 'https://github.com/strace/strace/releases/download/v{{version.raw}}/strace-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--disable-dependency-tracking', '--disable-silent-rules', '--enable-mpers=no', '--prefix="{{prefix}}"', '--disable-gcc-Werror'],
    },
  },
}
