import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rucio.cern.ch/rucio-client',
  name: 'rucio-client',
  description: 'Rucio - Scientific Data Management',
  homepage: 'https://rucio.cern.ch/',
  github: 'https://github.com/rucio/rucio',
  programs: [
    'rucio',
    'rucio-admin',
  ],
  // Ported from pkgx `versions: github: rucio/rucio`. Tags are plain semver
  // (e.g. `40.2.0`), so {{version.tag}} == {{version}} for the distributable URL.
  versionSource: {
    type: 'github-releases',
    repo: 'rucio/rucio',
    stable: true,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'gnu.org/bash': '^5',
    // rucio-clients declares `requires-python = ">=3.9"` (no upper bound for
    // modern releases), so accept any >=3.9 interpreter. The pkgx `<3.13` cap
    // is dropped: CI provides python.org 3.14.x and the published client wheels
    // install cleanly there.
    'python.org': '>=3.9',
  },
  distributable: {
    url: 'https://github.com/rucio/rucio/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    // The pkgx recipe drove a local source build via `tools/build_sdist*.sh`,
    // which invokes the *system* `python3 -m build` (the `build` module is never
    // installed) and `setuputil.py install` (a helper module with no setup()
    // entry point — a no-op). It then `pip install`ed the *server* package
    // `rucio[...]` with several extras (`sqlite`/`ldap`/`webui`/`webapi`/`vo`)
    // that do not exist in modern releases. That whole dance is vestigial: the
    // binaries this recipe ships (`rucio`, `rucio-admin`) come from the published
    // `rucio-clients` wheel, whose runtime deps are all pure-Python. So we just
    // stage a venv and install the pinned client release into it.
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install --upgrade pip setuptools wheel',
      '${{prefix}}/venv/bin/pip install rucio-clients=={{version}}',
      'bkpyvenv seal {{prefix}} rucio rucio-admin',
    ],
  },
  test: {
    script: [
      'test "$(rucio --version | tail -n1 |cut -d\' \' -f 2)" = {{version}}',
      'test "$(rucio-admin --version | tail -n1 |cut -d\' \' -f 2)" = {{version}}',
    ],
  },
}
