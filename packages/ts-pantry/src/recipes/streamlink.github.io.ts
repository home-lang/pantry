import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'streamlink.github.io',
  name: 'streamlink',
  description: 'Streamlink is a CLI utility which pipes video streams from various services into a video player',
  homepage: 'https://streamlink.github.io/',
  github: 'https://github.com/streamlink/streamlink',
  programs: ['streamlink'],
  versionSource: {
    type: 'github-releases',
    repo: 'streamlink/streamlink',
  },
  distributable: {
    url: 'https://github.com/streamlink/streamlink/releases/download/{{version}}/streamlink-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.12',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} streamlink',
    ],
  },
}
