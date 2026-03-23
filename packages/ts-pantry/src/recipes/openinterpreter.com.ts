import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'openinterpreter.com',
  name: 'open-interpreter',
  description: 'A natural language interface for computers',
  homepage: 'http://openinterpreter.com/',
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
    'python.org': '>=3.10<3.13',
    'github.com/mattrobenolt/jinja2-cli': '*',
  },

  build: {
    script: [
      'python3 -m pip install --break-system-packages poetry poetry-core "setuptools<78" wheel 2>/dev/null || true',
      'python-venv.sh {{prefix}}/bin/interpreter',
      'cd "${{prefix}}/venv/lib/python{{deps.python.org.version.marketing}}/site-packages/"',
      'OOBA_VERSION=$(echo ooba-*-dist.info | sed \'s/ooba-\\(.*\\)-dist.info/\\1/\')',
      'cd ooba/utils',
      'sed -i.bak -e"s/raise Exception.*/return \\"v1.7\\"/" get_latest_release.py',
      'rm get_latest_release.py.bak',
      '',
    ],
  },
}
