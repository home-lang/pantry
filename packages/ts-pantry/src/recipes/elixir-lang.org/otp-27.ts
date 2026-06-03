import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'elixir-lang.org/otp-27',
  name: 'otp-27',
  programs: [],
  dependencies: {
    'erlang.org': '^27',
  },
  distributable: {
    url: 'https://github.com/elixir-lang/elixir/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make install PREFIX={{prefix}}',
    ],
  },
  test: {
    script: [
      'elixir --version | grep "compiled with Erlang/OTP 27"',
      'mkdir test',
      'cp $FIXTURE test/test.exs',
      'cd test',
      'elixir test.exs',
    ],
  },
}
