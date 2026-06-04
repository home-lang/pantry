import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "cr.yp.to/daemontools",
  name: "daemontools",
  programs: [
    "envdir",
    "envuidgid",
    "fghack",
    "multilog",
    "pgrphack",
    "readproctitle",
    "setlock",
    "setuidgid",
    "softlimit",
    "supervise",
    "svc",
    "svok",
    "svscan",
    "svscanboot",
    "svstat",
    "tai64n",
    "tai64nlocal",
  ],
  buildDependencies: {
    'gnu.org/gcc': "*",
    linux: {
      'kernel.org/linux-headers': "*",
      'curl.se': "*",
      'gnu.org/patch': "*",
    },
  },
  distributable: {
    url: "https://cr.yp.to/daemontools/daemontools-{{version.marketing}}.tar.gz",
    stripComponents: 2,
  },
  build: {
    script: [
      {
        run: "curl -L \"$PATCH\"| patch -p2",
        if: "linux",
        'working-directory': "$SRCROOT",
      },
      "sed -i.bak 's|/service|{{prefix}}/etc/service|g' package/run",
      "rm package/run.bak",
      "sed -i.bak 's|/service|{{prefix}}/etc/service|g' src/svscanboot.sh",
      "rm src/svscanboot.sh.bak",
      {
        run: "sed -i.bak 's|( cat warn-shsgr; exit 1 )|cat warn-shsgr|g' src/Makefile\nrm src/Makefile.bak\n",
        if: "linux",
      },
      {
        run: "xcrun package/compile",
        if: "darwin",
      },
      {
        run: "package/compile",
        if: "linux",
      },
      "mkdir -p {{prefix}}/bin",
      "install command/* {{prefix}}/bin/",
      {
        run: "sed -i.bak \"s|{{prefix}}|\\$(dirname \\$0)/..|g\" svscanboot\nrm svscanboot.bak\n",
        'working-directory': "{{prefix}}/bin",
      },
    ],
    env: {
      PATCH: "https://raw.githubusercontent.com/Homebrew/formula-patches/212baeaf8232802cf3dfbfcc531efa5741325bfa/daemontools/errno.patch",
    },
  },
  test: {
    script: [
      "softlimit -t 1 echo 'Tea.xyz' | grep 'Tea.xyz'",
    ],
  },
}
