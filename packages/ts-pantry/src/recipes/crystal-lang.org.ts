import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  propsDir: 'props/crystal-lang.org',
  domain: 'crystal-lang.org',
  name: 'crystal',
  description: 'Fast and statically typed, compiled language with Ruby-like syntax',
  homepage: 'https://crystal-lang.org/',
  github: 'https://github.com/crystal-lang/crystal',
  programs: ['crystal'],
  versionSource: {
    type: 'github-releases',
    repo: 'crystal-lang/crystal',
    tagPattern: /^v(.+)$/,
  },
  dependencies: {
    'hboehm.info/gc': '^8',
    'gnu.org/gmp': '^6',
    'libevent.org': '^2',
    'pyyaml.org/libyaml': '^0',
    'llvm.org': '<17',
    'openssl.org': '^1.1',
    'pcre.org/v2': '^10',
    'freedesktop.org/pkg-config': '^0',
    'sourceware.org/libffi': '^3',
    'invisible-island.net/ncurses': '^6',
  },
  buildDependencies: {
    'curl.se': '*',
    'linux/aarch64': {
      'gnu.org/binutils': '*', // ar
    },
  },
  distributable: {
    url: 'https://github.com/crystal-lang/crystal/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      // third party support for linux-aarch64 — bootstrap a prebuilt crystal
      {
        'working-directory': '.bootstrap',
        run: [
          'if test \'{{hw.platform}}+{{hw.arch}}\' = \'linux+aarch64\'; then',
          '  curl -L "https://packagecloud.io/84codes/crystal/packages/any/any/crystal_1.13.3-145_arm64.deb/download.deb?distro_version_id=35" -o crystal.deb',
          '  ar x crystal.deb',
          '  tar zxf data.tar.gz --strip-components=2',
          'else',
          '  curl -Lf "https://github.com/crystal-lang/crystal/releases/download/{{version}}/crystal-{{version}}-1-$PLATFORM.tar.gz" | tar --strip-components=1 -zxf -',
          'fi',
        ].join('\n'),
      },
      'mkdir -p .build',
      'make deps',
      // On Ubuntu the wide tinfo dev symlink (libtinfow.so) usually doesn't exist —
      // the symbols crystal needs ship in libtinfo (libtinfo-dev), so link -ltinfo on linux.
      { run: 'export LDFLAGS="$LDFLAGS -Wl,-ltinfo"', if: 'linux' },
      'make crystal $ARGS',
      'mkdir -p "{{prefix}}/bin"',
      'cp .build/crystal "{{prefix}}/bin/crystal.bin"',
      'cp props/shim "{{prefix}}/bin/crystal"',
      'cp -a src "{{prefix}}/lib"',

      // regression in 1.14.0
      {
        'working-directory': '${{prefix}}/lib/crystal/system/unix',
        if: '=1.14.0',
        run: [
          'if test "{{hw.platform}}" = "darwin"; then',
          '  sed -i \'s/mask = LibC::SigsetT.new$/mask = LibC::SigsetT.new(0_u32)/\' pthread.cr',
          'fi',
        ].join('\n'),
      },
    ],
    env: {
      CRYSTAL_LIBRARY_PATH: '$LD_LIBRARY_PATH',
      PATH: '$SRCROOT/.bootstrap/bin:$PATH',
      darwin: { PLATFORM: 'darwin-universal' },
      'linux/x86-64': { PLATFORM: 'linux-x86_64' },
      LDFLAGS: '-Wl,-rpath,{{pkgx.prefix}}',
      ARGS: [
        'release=true',
        'FLAGS=--no-debug',
        'interpreter=true',
        'CRYSTAL_CONFIG_PATH=../lib',
      ],
      linux: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
    },
  },
}
