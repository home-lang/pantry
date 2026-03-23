import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'agpt.co',
  name: 'Auto-GPT',
  description: 'AutoGPT is the vision of accessible AI for everyone, to use and to build on. Our mission is to provide the tools, so that you can focus on what matters.',
  homepage: 'https://agpt.co',
  github: 'https://github.com/Significant-Gravitas/Auto-GPT',
  programs: ['auto-gpt'],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'Significant-Gravitas/Auto-GPT',
  },
  distributable: {
    url: 'https://github.com/Significant-Gravitas/Auto-GPT/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3.10<3.12',
    'redis.io': '^7',
    'tea.xyz': '^0',
  },

  build: {
    script: [
      'cd "${{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages"',
      'cp -R $SRCROOT/autogpt .',
      'python-venv.py {{prefix}}/bin/auto-gpt --requirements-txt',
      'cp props/auto-gpt {{prefix}}/venv/bin',
      'cd "{{prefix}}/share"',
      'cp $SRCROOT/.env.template env.template',
      'cp $SRCROOT/prompt_settings.yaml .',
      '',
      'cp props/entrypoint.sh {{prefix}}',
    ],
  },
}
