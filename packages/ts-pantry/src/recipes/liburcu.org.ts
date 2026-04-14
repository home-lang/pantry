import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'liburcu.org',
  name: 'liburcu',
  description: 'liburcu is a LGPLv2.1 userspace RCU (read-copy-update) library. This data synchronization library provides read-side access which scales linearly with the number of cores.',
  homepage: 'https://liburcu.org',
  github: 'https://github.com/urcu/userspace-rcu',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'urcu/userspace-rcu',
  },
  distributable: {
    url: 'https://lttng.org/files/urcu/userspace-rcu-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{hw.concurrency}} install',
    ],
  },
}
