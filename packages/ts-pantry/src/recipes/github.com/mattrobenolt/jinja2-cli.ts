import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/mattrobenolt/jinja2-cli",
  name: "jinja2-cli",
  programs: [
    "jinja2",
  ],
  dependencies: {
    'python.org': ">=3.7<3.12",
  },
  distributable: {
    url: "https://github.com/mattrobenolt/jinja2-cli/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "python-venv.sh {{prefix}}/bin/jinja2",
      {
        run: "ln -s \\\n  python{{deps.python.org.version.marketing}} \\\n  python{{deps.python.org.version.major}}\n",
        'working-directory': "${{prefix}}/venv/lib",
      },
    ],
  },
  test: {
    script: [
      "echo \{{ title }}\ > test.tmpl",
      "OUT=\"$(jinja2 test.tmpl $FIXTURE --format=json)\"",
      "test \"$OUT\" = \"tea.xyz\"",
    ],
  },
}
