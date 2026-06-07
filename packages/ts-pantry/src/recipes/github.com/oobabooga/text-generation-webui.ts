import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/oobabooga/text-generation-webui",
  name: "text-generation-webui",
  propsDir: "../../props/github.com/oobabooga/text-generation-webui",
  programs: [
    "text-generation-webui",
  ],
  platforms: ['darwin'],
  dependencies: {
    'python.org': "~3.10",
    'pkgx.sh': ">=1",
  },
  buildDependencies: {
    'gnu.org/coreutils': "*",
  },
  distributable: {
    url: "https://github.com/oobabooga/text-generation-webui/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "mkdir -p {{prefix}}/venv/bin",
      "cp -R . {{prefix}}/venv/bin",
      {
        run: "rm -rf docker .github docs .gitignore *.md",
        'working-directory': "{{prefix}}/venv/bin",
      },
      "python -m venv {{prefix}}/venv\nsource {{prefix}}/venv/bin/activate\n",
      "pip install torch torchvision torchaudio",
      {
        run: "REQS=\"requirements/full/$REQS\"",
        if: ">=3",
      },
      {
        run: "sed -i -e's/llama_cpp_python-0.2.11-cp310-cp310-macosx_13_0_x86_64.whl/llama_cpp_python-0.2.11-cp310-cp310-macosx_12_0_x86_64.whl/' $REQS",
        if: "darwin",
      },
      "pip install -r $REQS",
      {
        run: "echo '#!/usr/bin/env python' > text-generation-webui\necho 'import os' >> text-generation-webui\necho 'os.chdir(os.path.dirname(os.path.abspath(__file__)))' >> text-generation-webui\ncat server.py >> text-generation-webui\nchmod +x text-generation-webui\nrm server.py",
        'working-directory': "{{prefix}}/venv/bin",
      },
      "python-venv-stubber.sh text-generation-webui",
      "cp props/entrypoint.sh {{prefix}}",
    ],
    env: {
      linux: {
        REQS: "requirements.txt",
      },
      'darwin/aarch64': {
        REQS: "requirements_apple_silicon.txt",
      },
      'darwin/x86-64': {
        REQS: "requirements_apple_intel.txt",
      },
    },
  },
  test: {
    script: [
      "text-generation-webui --help",
    ],
  },
}
