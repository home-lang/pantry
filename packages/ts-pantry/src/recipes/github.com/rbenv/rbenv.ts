import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/rbenv/rbenv',
  name: 'rbenv',
  programs: [
    'rbenv',
  ],
  dependencies: {
    'ruby-lang.org': '*',
  },
  distributable: {
    url: 'https://github.com/rbenv/rbenv/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'src/configure',
      'make -C src',
      'mkdir -p {{prefix}}',
      'mv bin completions libexec rbenv.d {{prefix}}/',
    ],
  },
  test: {
    script: [
      'rbenv --version | grep {{version}}',
      'mkdir -p "$(rbenv root)/versions/1.2.3/bin"',
      'echo \'echo hello\' > "$(rbenv root)/versions/1.2.3/bin/foo"',
      'chmod +x "$(rbenv root)/versions/1.2.3/bin/foo"',
      'rbenv init -',
      'rbenv versions | grep "1.2.3"',
    ],
  },
}
