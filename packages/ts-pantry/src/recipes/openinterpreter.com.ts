import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openinterpreter.com',
  name: 'open-interpreter',
  description: 'A natural language interface for computers',
  homepage: 'https://openinterpreter.com/',
  github: 'https://github.com/KillianLucas/open-interpreter',
  programs: ['interpreter'],
  versionSource: {
    type: 'github-releases',
    repo: 'KillianLucas/open-interpreter',
  },
  distributable: {
    url: 'https://github.com/KillianLucas/open-interpreter/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3.10<3.12',
    'github.com/mattrobenolt/jinja2-cli': '*',
  },
  // tiktoken (a transitive dep) ships no prebuilt wheel for this target, so pip
  // builds it from source — that needs a Rust toolchain + cargo to compile.
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/interpreter',
      // ooba calls the github api, which has frequent rate-limit failures.
      // returning the current value isn't the best, but it should fix this.
      // Only applies to <0.1.11 where the bundled `ooba` package exists.
      {
        run: [
          'OOBA_VERSION=$(echo ooba-*-dist.info | sed \'s/ooba-\\(.*\\)-dist.info/\\1/\')',
          'cd ooba/utils',
          'sed -i.bak -e"s/raise Exception.*/return \\"v1.7\\"/" get_latest_release.py',
          'rm get_latest_release.py.bak',
        ],
        'working-directory': '${{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages/',
        if: '<0.1.11',
      },
    ],
  },
}
