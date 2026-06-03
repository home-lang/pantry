import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/inetutils",
  name: "inetutils",
  programs: [
    "dnsdomainname",
    "ftp",
    "hostname",
    "ifconfig",
    "logger",
    "ping",
    "ping6",
    "rcp",
    "rexec",
    "rlogin",
    "rsh",
    "talk",
    "telnet",
    "tftp",
    "traceroute",
    "whois",
    "ftpd",
    "inetd",
    "rexecd",
    "rlogind",
    "rshd",
    "syslogd",
    "talkd",
    "telnetd",
    "tftpd",
    "uucpd",
  ],
  dependencies: {
    'gnu.org/libidn2': "*",
    'invisible-island.net/ncurses': "*",
  },
  buildDependencies: {
    'gnu.org/help2man': 1,
  },
  distributable: {
    url: "https://ftp.gnu.org/gnu/inetutils/inetutils-{{version.marketing}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if test \"{{hw.platform}}\" = \"darwin\"; then\n  sed -i -e 's/char \\*ttymsg (struct iovec \\*, int, char \\*, int);/char *ttymsg (struct iovec *, int, const char *, int);/' syslogd.c\nfi\n",
        if: "2.5.0",
        'working-directory': "src",
      },
      "./configure $ARGS",
      "make SUIDMODE= install",
      "mkdir \"{{prefix}}\"/sbin",
      {
        run: "for x in *; do ln -s ../libexec/$x ../sbin; done",
        'working-directory': "{{prefix}}/libexec",
      },
    ],
    env: {
      ARGS: [
        "--prefix=\"{{prefix}}\"",
        "--disable-silent-rules",
        "--with-idn",
        "--with-ncurses-include-dir=\"{{ deps.invisible-island.net/ncurses.prefix }}/include\"",
      ],
      linux: {
        LDFLAGS: [
          "-ltinfo",
        ],
      },
    },
  },
}
