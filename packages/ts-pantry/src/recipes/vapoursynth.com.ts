import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vapoursynth.com',
  name: 'vspipe',
  description: 'A video processing framework with simplicity in mind',
  homepage: 'https://www.vapoursynth.com',
  github: 'https://github.com/vapoursynth/vapoursynth',
  programs: ['vspipe'],
  versionSource: {
    type: 'github-releases',
    repo: 'vapoursynth/vapoursynth',
    tagPattern: /^R(.+)$/,
  },
  distributable: {
    url: 'https://github.com/vapoursynth/vapoursynth/archive/R{{version.major}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
    'github.com/sekrit-twc/zimg': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'cython.org': '*',
    'gnu.org/libtool': '*',
    'nasm.us': '*',
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      'if ! command -v glibtool &>/dev/null; then',
      '  BREW_LIBTOOL="$(brew --prefix libtool 2>/dev/null)/bin"',
      '  if [ -f "$BREW_LIBTOOL/glibtool" ]; then',
      '    export PATH="$BREW_LIBTOOL:$PATH"',
      '  fi',
      'fi',
      '# Ensure aclocal can find libtool M4 macros (needed for autoreconf)',
      'BREW_LT_SHARE="$(brew --prefix libtool 2>/dev/null)/share/aclocal"',
      'if [ -d "$BREW_LT_SHARE" ]; then',
      '  export ACLOCAL_PATH="${BREW_LT_SHARE}${ACLOCAL_PATH:+:$ACLOCAL_PATH}"',
      'fi',
      'export MACOSX_DEPLOYMENT_TARGET=13.3',
      'export MACOSX_DEPLOYMENT_TARGET=13.4',
      './autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'cd "{{prefix}}/lib"',
      'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}} || true',
      'cd "{{prefix}}/lib/pkgconfig"',
      'sed -i -e "s|{{pkgx.prefix}}|\\${pcfiledir}/../../../..|g" -e "s|python.org/v{{deps.python.org.version}}|python.org/v{{deps.python.org.version.marketing}}|g" -e \'s/\\+brewing//g\' *.pc',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-silent-rules', '--disable-dependency-tracking', '--with-cython={{deps.cython.org.prefix}}/bin/cython', '--with-python_prefix={{prefix}}', '--with-python_exec_prefix={{prefix}}'],
    },
  },
}
