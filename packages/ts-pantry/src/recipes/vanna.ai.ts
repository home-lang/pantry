import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vanna.ai',
  name: 'Vanna',
  description: '🤖 Chat with your SQL database 📊. Accurate Text-to-SQL Generation via LLMs using RAG 🔄.',
  homepage: 'https://vanna.ai/docs/',
  github: 'https://github.com/vanna-ai/vanna',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'vanna-ai/vanna',
  },
  distributable: {
    url: 'git+https://github.com/vanna-ai/vanna.git',
  },
  dependencies: {
    'python.org': '~3.12',
  },
  buildDependencies: {
    'rust-lang.org': '^1.85',
    'rust-lang.org/cargo': '^0.90',
  },

  build: {
    script: [
      'python -m pip install . --prefix={{prefix}}',
      'python -m pip install openai mistralai --prefix={{prefix}}',
      'python -m pip install chromadb python-dotenv onnxruntime --prefix={{prefix}}',
      'python -m pip install anthropic --prefix={{prefix}}',
      'python -m pip install google-generativeai --prefix={{prefix}}',
      'python -m pip install qdrant-client fastembed --prefix={{prefix}}',
      'python -m pip install \'pymilvus[model]\' --prefix={{prefix}}',
      'rm -rf ${{prefix}}/lib/python{{deps.python.org.version.marketing}}/site-packages/proto',
      'python -m pip install proto-plus==1.24.0.dev1 --prefix={{prefix}}',
      '',
      'python -m pip install --no-deps --force-reinstall --no-cache-dir -v --no-binary :all: --prefix={{prefix}} safetensors',
      'cd "${{prefix}}/lib"',
      'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
    ],
  },
}
