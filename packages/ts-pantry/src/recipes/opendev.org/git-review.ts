import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opendev.org/git-review',
  name: 'git-review',
  programs: [
    'git-review',
  ],
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '^3',
  },
  distributable: undefined,
  build: {
    script: [
      'pip download --no-deps --no-binary :all: --dest . git_review=={{version}}',
      'tar zxvf git_review-{{version}}.tar.gz --strip-components=1',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      {
        run: '${{prefix}}/venv/bin/pip install setuptools',
        if: '<2.4',
      },
      'bkpyvenv seal {{prefix}} git-review',
    ],
  },
  test: {
    script: [
      'git-review --version | tee /dev/stderr | grep -q -w \'{{version}}\'',
      'git init --initial-branch main',
      'git config user.name PkgxTestBot',
      'git config user.email PkgxTestBot@test.com',
      'git remote add gerrit https://github.com/pkgxdev/pkgx',
      'touch .git/hooks/commit-msg',
      'chmod +x .git/hooks/commit-msg',
      'git commit --message "Test commit" --allow-empty',
      'git-review --dry-run main | tee /dev/stderr | grep -q -w -E \'git +push\'',
    ],
  },
}
