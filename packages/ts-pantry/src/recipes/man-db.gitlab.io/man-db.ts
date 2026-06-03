import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "man-db.gitlab.io/man-db",
  name: "man-db",
  programs: [
    "apropos",
    "catman",
    "lexgrog",
    "man",
    "mandb",
    "manpath",
    "man-recode",
    "whatis",
  ],
  dependencies: {
    'libpipeline.gitlab.io/libpipeline': "*",
    'gnu.org/groff': "*",
    linux: {
      'gnu.org/gdbm': "*",
    },
  },
  buildDependencies: {
    'gnu.org/make': "*",
    'freedesktop.org/pkg-config': "*",
  },
  distributable: {
    url: "https://download.savannah.nongnu.org/releases/man-db/man-db-{{version}}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      "./configure $CONFIGURE_ARGS",
      "make --jobs {{hw.concurrency}} install",
      "sed -i.bak \"s|$PKGX_DIR|\\$PKGX_DIR|g\" {{prefix}}/etc/systemd/system/man-db.service",
      "rm {{prefix}}/etc/systemd/system/man-db.service.bak",
      {
        run: "# Creating stubs\nfor name in $(ls {{prefix}}/libexec/bin)\ndo\ncat <<EOF >$name\n#!/bin/bash\n\nconfig_file=\"\\$(dirname \\$0)/../../etc/man_db.conf\"\n\n\\$(dirname \\$0)/../libexec/bin/$name --config-file=\"\\$config_file\" \"\\$@\"\nEOF\nchmod +x $name\ndone\n\n# These binaries do not require a config file\nrm lexgrog man-recode\nln -s ../libexec/bin/lexgrog lexgrog\nln -s ../libexec/bin/man-recode man-recode\n",
        'working-directory': "{{prefix}}/bin",
      },
      {
        run: "if test -d man-db; then\n  mv man-db/* .\n  rmdir man-db\n  ln -s . man-db\nfi\n",
        'working-directory': "{{prefix}}/lib",
      },
    ],
    env: {
      CONFIGURE_ARGS: [
        "--disable-debug",
        "--disable-dependency-tracking",
        "--prefix=\"{{prefix}}\"",
        "--libdir=\"{{prefix}}/lib\"",
        "--bindir=\"{{prefix}}/libexec/bin\"",
        "--disable-silent-rules",
        "--disable-cache-owner",
        "--disable-setuid",
        "--disable-nls",
        "--localstatedir=\"{{prefix}}/var\"",
        "--with-config-file=\"{{prefix}}/etc/man_db.conf\"",
        "--with-systemdsystemunitdir=\"{{prefix}}/etc/systemd/system\"",
        "--with-systemdtmpfilesdir=\"{{prefix}}/lib/tmpfiles.d\"",
      ],
    },
  },
  test: {
    script: [
      "man --version | grep {{version}}",
      "which man | grep {{prefix}}",
      "man man",
    ],
  },
}
