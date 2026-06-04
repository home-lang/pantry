import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/eliben/pycparser',
  name: 'pycparser',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    // Upstream tags are `release_v{major}.{minor zero-padded to 2 digits}` with no
    // patch component (e.g. 3.0.0 → release_v3.00, 2.23.0 → release_v2.23). The
    // {{version}} catalog form (3.0.0) can't reproduce that zero-padding, so resolve
    // the real tag via the GitHub API using {{version.tag}}.
    url: 'https://github.com/eliben/pycparser/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
      'mkdir -p {{prefix}}/pkgshare',
      'cp -r examples {{prefix}}/pkgshare/',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '{{prefix}}/lib',
      },
    ],
  },
  test: {
    script: [
      // pip installs pycparser into {{prefix}}/lib/pythonX.Y/site-packages; the test
      // runner doesn't set PYTHONPATH, so discover the dir and export it inline before
      // running the example (which does `import pycparser`).
      'export PYTHONPATH="$(dirname "$(find {{prefix}}/lib -name "c_lexer.py" -path "*pycparser*" | head -1)")/.."',
      'python {{prefix}}/pkgshare/examples/c-to-c.py {{prefix}}/pkgshare/examples/c_files/basic.c',
    ],
  },
}
