import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sourceware.org/libffi',
  name: 'libffi',
  description: 'A portable foreign-function interface library.',
  homepage: 'http://sourceware.org/libffi',
  github: 'https://github.com/libffi/libffi',
  programs: [],
  versionSource: {
    type: 'github-tags',
    repo: 'libffi/libffi',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/libffi/libffi/releases/download/v{{version}}/libffi-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}} --disable-debug',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
