import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'linux-pam.org',
  name: 'linux-pam',
  description: 'Linux PAM (Pluggable Authentication Modules for Linux) project',
  github: 'https://github.com/linux-pam/linux-pam',
  programs: ['faillock', 'mkhomedir_helper', 'pam_namespace_helper', 'pam_timestamp_check', 'unix_chkpwd'],
  // PAM (Pluggable Authentication Modules) is a Linux-only subsystem; upstream pkgx pins platforms: [linux].
  platforms: ['linux'],
  versionSource: {
    type: 'github-releases',
    repo: 'linux-pam/linux-pam',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/linux-pam/linux-pam/releases/download/v{{version}}/Linux-PAM-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'github.com/thkukuk/libnsl': '*',
    'sourceforge.net/libtirpc': '*',
    'github.com/besser82/libxcrypt': '*',
  },
  buildDependencies: {
    'gnu.org/gcc': '*',
    'gnu.org/make': '*',
    'mesonbuild.com': '*', // since 1.7.0
    'ninja-build.org': '*', // since 1.7.0
  },

  build: {
    script: [
      // 1.6.0 is missing an include
      {
        run: [
          'sed -i -e \'/argv_parse\\.h/a\\',
          '#include <stdint.h>\\',
          '\' pam_namespace.c',
        ],
        'working-directory': 'modules/pam_namespace',
        if: '=1.6.0',
      },
      {
        run: [
          './configure $CONFIGURE_ARGS',
          'make --jobs {{hw.concurrency}}',
          'make --jobs {{hw.concurrency}} install',
        ],
        if: '<1.7.0',
      },
      {
        run: [
          'meson setup build $MESON_ARGS',
          'meson compile -C build --verbose',
          'meson install -C build',
        ],
        if: '>=1.7.0',
      },
      {
        run: 'sed -i "s|{{prefix}}|$(dirname $0)/..|g" pam_namespace_helper',
        'working-directory': '{{prefix}}/sbin',
      },
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--disable-db',
        '--disable-silent-rules',
        '--disable-selinux',
        '--includedir={{prefix}}/include/security',
        '--oldincludedir={{prefix}}/include',
        '--enable-securedir={{prefix}}/lib/security',
        '--sysconfdir={{prefix}}/etc',
        '--with-xml-catalog={{prefix}}/etc/xml/catalog',
      ],
      MESON_ARGS: [
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--buildtype=release',
        '--wrap-mode=nofallback',
        '-Dsecuredir={{prefix}}/lib/security',
        '-Dsysconfdir={{prefix}}/etc',
        '-Dxml-catalog={{prefix}}/etc/xml/catalog',
        '-Dvendordir={{prefix}}/share/pam',
        '-Dexamples=false',
      ],
    },
  },
}
