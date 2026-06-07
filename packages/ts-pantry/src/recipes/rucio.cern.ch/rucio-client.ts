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
    'python.org': '>=3.9<3.13',
    // to build psycopg2
    'postgresql.org': '*',
  },
  distributable: {
    url: 'https://github.com/rucio/rucio/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // bkpyvenv stages the venv with bare `python3`, which on some CI runners
      // (notably macOS, where /usr/bin/python3 is the 3.9.6 Xcode CLT python)
      // can resolve to an interpreter outside rucio's supported >=3.9<3.13
      // range. Pin python3 to an in-range interpreter via a cc-wrapper shim
      // (early on PATH) before bkpyvenv runs, preferring the python.org build dep.
      'mkdir -p "${TMPDIR:-/tmp}/_cc_wrapper"',
      'for _py in {{deps.python.org.prefix}}/bin/python3 python3.12 python3.11 python3.10 python3.9 python3; do '
        + '_pybin="$(command -v "$_py" 2>/dev/null || ([ -x "$_py" ] && echo "$_py") || true)"; '
        + '[ -n "$_pybin" ] || continue; '
        + '_pyver="$("$_pybin" -c \'import sys;print("%d%02d"%sys.version_info[:2])\' 2>/dev/null || echo 0)"; '
        + 'if [ "$_pyver" -ge 309 ] 2>/dev/null && [ "$_pyver" -lt 313 ] 2>/dev/null; then '
        + 'ln -sf "$_pybin" "${TMPDIR:-/tmp}/_cc_wrapper/python3"; '
        + 'ln -sf "$_pybin" "${TMPDIR:-/tmp}/_cc_wrapper/python"; '
        + 'echo "[rucio] using python3 in [3.9,3.13): $_pybin ($_pyver)"; break; fi; done',
      'hash -r 2>/dev/null || true',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install setuptools wheel',
      './tools/build_sdist*.sh clients',
      {
        run: '${{prefix}}/venv/bin/python setup.py install',
        if: '<39',
      },
      {
        run: '${{prefix}}/venv/bin/python setuputil.py install',
        if: '>=39',
      },
      {
        run: '${{prefix}}/venv/bin/pip install dogpile.cache',
        if: '>=35',
      },
      {
        run: '${{prefix}}/venv/bin/pip install click',
        if: '>=37',
      },
      {
        run: '${{prefix}}/venv/bin/pip install rucio[mysql,postgresql,sqlite,ldap,webui,webapi,vo]=={{version}}',
        if: '>=35',
      },
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
