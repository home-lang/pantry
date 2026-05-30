import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'borgbackup.org',
  name: 'borg',
  description: 'Deduplicating archiver with compression and authenticated encryption.',
  homepage: 'https://www.borgbackup.org/',
  github: 'https://github.com/borgbackup/borg',
  programs: ['borg', 'borgfs'],
  versionSource: {
    type: 'github-releases',
    repo: 'borgbackup/borg',
  },
  distributable: {
    url: 'https://github.com/borgbackup/borg/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
    'github.com/Cyan4973/xxHash': '^0.8',
  },
  buildDependencies: {
    'python.org': '^3.10',
    'openssl.org': '^1.1',
    'facebook.com/zstd': '*',
    'lz4.org': '*',
    linux: {
      'savannah.nongnu.org/acl': '^2.3.1',
    },
  },

  build: {
    script: [
      // borgbackup 1.4.x requires Python >=3.10 (pyproject `requires-python = ">=3.10"`).
      // The bkpyvenv shim creates the venv with bare `python3`, which on some CI
      // runners (notably macOS, where /usr/bin/python3 is the 3.9.6 Xcode CLT
      // python) resolves to a <3.10 interpreter and pip refuses to install borg.
      // The python.org build dep can also fall back to that same system python
      // when no >=3.10 binary is in the registry for this platform. Pin python3 to
      // a >=3.10 interpreter by shimming it into the cc-wrapper dir (early on PATH)
      // before bkpyvenv runs.
      'mkdir -p "${TMPDIR:-/tmp}/_cc_wrapper"',
      'for _py in python3.13 python3.12 python3.11 python3.10 "{{deps.python.org.prefix}}/bin/python3" python3; do '
        + '_pybin="$(command -v "$_py" 2>/dev/null || ([ -x "$_py" ] && echo "$_py") || true)"; '
        + '[ -n "$_pybin" ] || continue; '
        + '_pyver="$("$_pybin" -c \'import sys;print("%d%02d"%sys.version_info[:2])\' 2>/dev/null || echo 0)"; '
        + 'if [ "$_pyver" -ge 310 ] 2>/dev/null; then '
        + 'ln -sf "$_pybin" "${TMPDIR:-/tmp}/_cc_wrapper/python3"; '
        + 'ln -sf "$_pybin" "${TMPDIR:-/tmp}/_cc_wrapper/python"; '
        + 'echo "[borg] using python3 >=3.10: $_pybin ($_pyver)"; break; fi; done',
      'hash -r 2>/dev/null || true',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install -r requirements.d/development.txt',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} borg borgfs',
    ],
    env: {
      'BORG_OPENSSL_PREFIX': '{{deps.openssl.org.prefix}}',
      'BORG_LIBLZ4_PREFIX': '{{deps.lz4.org.prefix}}',
      'BORG_LIBZSTD_PREFIX': '{{deps.facebook.com/zstd.prefix}}',
      'BORG_LIBXXHASH_PREFIX': '{{deps.github.com/Cyan4973/xxHash.prefix}}',
      // libacl is Linux-only; on darwin BORG_LIBACL_PREFIX must be unset
      // (macOS has no libacl) so it stays inside the linux-keyed group.
      'BORG_LIBACL_PREFIX': {
        linux: '{{deps.savannah.nongnu.org/acl.prefix}}',
      },
    },
  },
}
