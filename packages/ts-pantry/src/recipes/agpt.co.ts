import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/agpt.co',
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
      // `pip install` seems to miss some vital .json files, so we must manually copy
      // we copy everything as we're not 100% sure which files are missing
      // we do this first so any file movements from `pip install` takes precedence
      {
        run: 'cp -R $SRCROOT/autogpt .',
        'working-directory': '{{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages',
      },
      'python-venv.py {{prefix}}/bin/auto-gpt --requirements-txt',
      // still pretty new and thus provides no executable, so we made one
      'cp props/auto-gpt {{prefix}}/venv/bin',
      {
        'working-directory': '{{prefix}}/share',
        run: [
          'cp $SRCROOT/.env.template env.template',
          'cp $SRCROOT/prompt_settings.yaml .',
        ].join('\n'),
      },
      'cp props/entrypoint.sh {{prefix}}',
    ],
  },
}
