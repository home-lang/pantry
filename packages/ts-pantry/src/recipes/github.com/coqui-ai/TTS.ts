import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/coqui-ai/TTS",
  name: "TTS",
  programs: [
    "tts",
    "tts-server",
    "ttx",
  ],
  dependencies: {
    'python.org': ">=3.7<3.11",
    'taku910.github.io/mecab': "*",
  },
  buildDependencies: {
    'pip.pypa.io': "*",
    'git-scm.org': "*",
  },
  distributable: {
    url: "https://github.com/coqui-ai/TTS/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "python-venv.py {{prefix}}/bin/tts",
      {
        run: "cp {{prefix}}/bin/tts {{prefix}}/bin/tts-server\ncp {{prefix}}/bin/tts {{prefix}}/bin/ttx\n",
        'working-directory': "${{prefix}}/bin",
      },
      {
        run: "rm -r nvidia",
        if: "linux",
        'working-directory': "${{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages",
      },
    ],
  },
}
