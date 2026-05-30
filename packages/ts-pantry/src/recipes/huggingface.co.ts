import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'huggingface.co',
  name: 'huggingface/cli',
  description: 'The official Python client for the Huggingface Hub.',
  homepage: 'https://huggingface.co/docs/huggingface_hub/index',
  github: 'https://github.com/huggingface/huggingface_hub',
  programs: ['huggingface-cli'],
  versionSource: {
    type: 'github-releases',
    repo: 'huggingface/huggingface_hub',
  },
  distributable: {
    url: 'https://github.com/huggingface/huggingface_hub/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      // huggingface_hub >=1 requires Python >=3.10 (pyproject `requires-python = ">=3.10"`).
      // The bkpyvenv shim creates the venv with bare `python3`, which on some CI
      // runners (notably macOS, where /usr/bin/python3 is the 3.9.6 Xcode CLT
      // python) resolves to a <3.10 interpreter and pip refuses to install
      // huggingface-hub ("requires a different Python: 3.9.6 not in '>=3.10.0'").
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
        + 'echo "[huggingface] using python3 >=3.10: $_pybin ($_pyver)"; break; fi; done',
      'hash -r 2>/dev/null || true',
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'ls -l {{prefix}}/{venv/,}bin || true',
      {
        run: [
          'bkpyvenv seal {{prefix}} huggingface-cli',
          'ln -s huggingface-cli {{prefix}}/venv/bin/hf',
          'ln -s huggingface-cli {{prefix}}/bin/hf',
        ],
        if: '<0.36.2',
      },
      {
        run: 'bkpyvenv seal {{prefix}} hf huggingface-cli',
        if: '>=0.36.2<1',
      },
      {
        run: [
          'bkpyvenv seal {{prefix}} hf',
          'ln -s hf {{prefix}}/venv/bin/huggingface-cli',
          'ln -s hf {{prefix}}/bin/huggingface-cli',
        ],
        if: '>=1<1.10.1',
      },
      {
        run: 'bkpyvenv seal {{prefix}} hf huggingface-cli',
        if: '>=1.10.1',
      },
    ],
  },
}
