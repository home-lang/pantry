import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'libuv.org',
  name: 'libuv',
  description: 'Cross-platform asynchronous I/O',
  homepage: 'https://libuv.org/',
  github: 'https://github.com/libuv/libuv',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'libuv/libuv',
  },
  distributable: {
    url: 'https://dist.libuv.org/dist/v{{version}}/libuv-v{{version}}-dist.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    script: [
      'cd "src/unix"',
      'if [ ! -f darwin-syscalls.h ]; then',
      '  curl -LSs \'https://raw.githubusercontent.com/libuv/libuv/1c778bd001543371c915a79b7ac3c5864fe59e74/src/unix/darwin-syscalls.h\' -o darwin-syscalls.h',
      'fi',
      '',
      './configure --prefix="{{prefix}}"',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
