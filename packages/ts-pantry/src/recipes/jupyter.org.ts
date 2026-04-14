import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jupyter.org',
  name: 'jupyter',
  description: 'JupyterLab computational environment.',
  homepage: 'https://jupyterlab.readthedocs.io/',
  github: 'https://github.com/jupyterlab/jupyterlab',
  programs: ['jlpm', 'jupyter', 'jupyter-bundlerextension', 'jupyter-dejavu', 'jupyter-events', 'jupyter-execute', 'jupyter-fileid', 'jupyter-kernel', 'jupyter-kernelspec', 'jupyter-lab', 'jupyter-labextension', 'jupyter-labhub', 'jupyter-migrate', 'jupyter-nbclassic', 'jupyter-nbclassic-bundlerextension', 'jupyter-nbclassic-extension', 'jupyter-nbclassic-serverextension', 'jupyter-nbconvert', 'jupyter-nbextension', 'jupyter-run', 'jupyter-server', 'jupyter-serverextension', 'jupyter-troubleshoot', 'jupyter-trust'],
  versionSource: {
    type: 'github-releases',
    repo: 'jupyterlab/jupyterlab',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/jupyterlab/jupyterlab/releases/download/v{{version}}/jupyterlab-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3.7<3.12',
    'gnu.org/which': '2',
  },

  build: {
    script: [
      'python-venv.py {{prefix}}/bin/jlpm',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-bundlerextension',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-dejavu',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-events',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-execute',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-fileid',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-kernel',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-kernelspec',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-lab',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-labextension',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-labhub',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-migrate',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-nbclassic',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-nbclassic-bundlerextension',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-nbclassic-extension',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-nbclassic-serverextension',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-nbconvert',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-nbextension',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-notebook',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-run',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-server',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-serverextension',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-troubleshoot',
      'cp {{prefix}}/bin/jlpm {{prefix}}/bin/jupyter-trust',
    ],
  },
}
