import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'langchain.com',
  name: 'langchain',
  description: '🦜🔗 Build context-aware reasoning applications',
  homepage: 'https://python.langchain.com',
  github: 'https://github.com/langchain-ai/langchain',
  programs: ['f2py', 'jsondiff', 'jsonpatch', 'jsonpointer', 'langchain-server', 'langsmith', 'normalizer'],
  // langchain stopped publishing `v`-prefixed GitHub *releases* after v0.1.16;
  // current releases are per-library (`langchain==1.3.4`) whose archive URL
  // `archive/v{{version}}.tar.gz` does not exist (404). The buildable line
  // (where `pip install .` in libs/langchain + the v-tag tarball both work)
  // is the `v0.1.x` tags, which only exist as git *tags*, not releases.
  // Gate version discovery to those stable `v`-prefixed tags.
  versionSource: {
    type: 'github-tags',
    repo: 'langchain-ai/langchain',
    tagPattern: /^v(\d+\.\d+\.\d+)$/,
  },
  distributable: {
    url: 'https://github.com/langchain-ai/langchain/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '^3.12',
    'docker.com/compose': '^2.23',
  },

  build: {
    workingDirectory: 'libs/langchain',
    script: [
      'python -m pip install --prefix={{prefix}} .',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/lib',
      },
      {
        run: 'sed -i\'\' "s|{{deps.python.org.prefix}}/bin/python|/usr/bin/env python|g" ./*',
        'working-directory': '${{prefix}}/bin',
      },
    ],
    env: {
      linux: {
        MULTIDICT_NO_EXTENSIONS: '1',
      },
    },
  },
}
