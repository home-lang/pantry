import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'erlang.org',
  name: 'erlang',
  description: 'Programming language for highly scalable real-time systems',
  homepage: 'https://www.erlang.org/',
  github: 'https://github.com/erlang/otp',
  programs: ['ct_run', 'dialyzer', 'epmd', 'erl', 'erlc', 'escript', 'run_erl', 'to_erl', 'typer'],
  versionSource: {
    type: 'github-releases',
    repo: 'erlang/otp',
    tagPattern: /^OTP (.+)$/,
  },
  distributable: {
    url: 'https://github.com/erlang/otp/releases/download/OTP-{{ version.raw }}/otp_src_{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'invisible-island.net/ncurses': '*',
  },
  buildDependencies: {
    'perl.org': '>=5',
  },

  build: {
    script: [
      './configure $ARGS',
      'make -j {{hw.concurrency}}',
      'make install',
      '# Fix Erlang scripts to resolve symlinks in $0 (enables dyn_erl relocation)',
      'for f in "{{prefix}}"/lib/erlang/bin/erl "{{prefix}}"/lib/erlang/bin/erlc "{{prefix}}"/lib/erlang/bin/escript "{{prefix}}"/lib/erlang/bin/ct_run "{{prefix}}"/lib/erlang/bin/dialyzer "{{prefix}}"/lib/erlang/bin/typer; do',
      '  [ -f "$f" ] || continue',
      '  [ -L "$f" ] && continue',
      '  sed -i.bak \'s#^prog="$0"#prog="$(readlink -f "$0" 2>/dev/null || echo "$0")"#g\' "$f"',
      '  rm -f "${f}.bak"',
      'done',
    ],
    env: {
      'CC': 'cc',
      'CXX': 'c++',
      'LD': 'ld',
      'CFLAGS': '-O2 -g $CFLAGS',
      'ERL_TOP': '$SRCROOT',
      'ARGS': ['--disable-debug', '--disable-silent-rules', '--prefix={{prefix}}', '--enable-dynamic-ssl-lib', '--enable-hipe', '--enable-smp-support', '--enable-threads', '--enable-pie', '--with-ssl={{deps.openssl.org.prefix}}', '--without-javac'],
    },
  },
}
