import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dozzle.dev',
  name: 'dozzle',
  description: 'Realtime log viewer for docker containers. ',
  homepage: 'https://dozzle.dev/',
  github: 'https://github.com/amir20/dozzle',
  programs: ['dozzle'],
  versionSource: {
    type: 'github-releases',
    repo: 'amir20/dozzle',
  },
  distributable: {
    url: 'https://github.com/amir20/dozzle/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '=1.25.7',
    'pnpm.io': '*',
    'openssl.org': '*',
    'protobuf.dev': '*',
    'abseil.io': '20250127',
    'grpc.io/grpc-go': '*',
  },

  build: {
    script: [
      { run: 'make -j {{hw.concurrency}} tools', if: '<10' },
      { run: 'cp ~/go/bin/* .', if: '<10', 'working-directory': '${{prefix}}/bin' },
      // The registry-built pnpm.io `bin/pnpm` launcher can be a broken/non-node
      // wrapper in CI (fails with `pnpm: line 1: Not: command not found`), which
      // breaks both `pnpm install` here and the implicit `pnpm build` inside
      // `make dist`. Resolve the real pnpm CLI bundle from the staged node_modules
      // and front a clean node-backed `pnpm` shim on PATH so all callers work.
      [
        'set -e',
        '_pnpm_bin="$(command -v pnpm || true)"',
        'if [ -z "$_pnpm_bin" ]; then echo "pnpm not found on PATH" >&2; exit 1; fi',
        '_pnpm_dir="$(cd "$(dirname "$_pnpm_bin")" && pwd)"',
        '_pnpm_root="$(dirname "$_pnpm_dir")"',
        // Prefer the bin launcher shim (works standalone via node), then dist bundle.
        '_pnpm_cjs=""',
        'for _c in "$_pnpm_root/bin/pnpm.cjs" "$_pnpm_dir/pnpm.cjs" "$_pnpm_root/dist/pnpm.cjs"; do',
        '  if [ -f "$_c" ]; then _pnpm_cjs="$_c"; break; fi',
        'done',
        '_node_bin="$(command -v node)"',
        'if [ -n "$_pnpm_cjs" ] && [ -n "$_node_bin" ]; then',
        '  mkdir -p "{{prefix}}/.pnpm-shim"',
        '  printf \'#!/bin/sh\\nexec "%s" "%s" "$@"\\n\' "$_node_bin" "$_pnpm_cjs" > "{{prefix}}/.pnpm-shim/pnpm"',
        '  chmod +x "{{prefix}}/.pnpm-shim/pnpm"',
        '  export PATH="{{prefix}}/.pnpm-shim:$PATH"',
        '  hash -r 2>/dev/null || true',
        '  echo "[dozzle] using node-backed pnpm shim: $_node_bin $_pnpm_cjs" >&2',
        'fi',
        'pnpm --version',
        'pnpm install',
      ].join('\n'),
      // otherwise on darwin/aarch64: EMFILE: too many open files, watch
      { run: 'sudo launchctl limit maxfiles 16384 16384', if: 'darwin/aarch64' },
      // make dist runs `pnpm build`; reuse the same node-backed shim resolved above.
      [
        'set -e',
        'if [ -x "{{prefix}}/.pnpm-shim/pnpm" ]; then',
        '  export PATH="{{prefix}}/.pnpm-shim:$PATH"',
        '  hash -r 2>/dev/null || true',
        'fi',
        'make dist generate',
      ].join('\n'),
      'go build -ldflags "$GO_LDFLAGS" -o {{prefix}}/bin/dozzle .',
      // Drop the temporary pnpm shim from the install prefix.
      'rm -rf "{{prefix}}/.pnpm-shim"',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/amir20/dozzle/internal/support/cli.Version={{version}}'],
    },
  },
}
