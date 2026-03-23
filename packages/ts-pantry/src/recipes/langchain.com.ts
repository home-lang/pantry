import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'langchain.com',
  name: 'langchain',
  description: '🦜🔗 Build context-aware reasoning applications',
  homepage: 'https://python.langchain.com',
  github: 'https://github.com/langchain-ai/langchain',
  programs: ['f2py', 'jsondiff', 'jsonpatch', 'jsonpointer', 'langchain-server', 'langsmith', 'normalizer'],
  versionSource: {
    type: 'github-releases',
    repo: 'langchain-ai/langchain',
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
    script: [
      'python -m pip install --prefix={{prefix}} .',
      'cd "${{prefix}}/lib"',
      'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
      'cd "${{prefix}}/bin"',
      'sed -i\'\' "s|{{deps.python.org.prefix}}/bin/python|/usr/bin/env python|g" ./*',
    ],
  },
}
