import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openssh.com',
  name: 'openssh',
  programs: ['scp', 'sftp', 'slogin', 'ssh', 'ssh-add', 'ssh-agent', 'ssh-keygen', 'ssh-keyscan', 'sshd'],
  distributable: {
    url: 'https://ftp.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-{{version.marketing}}p1.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '*',
    'thrysoee.dk/editline': '*',
    'github.com/besser82/libxcrypt': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'curl.se': '*',
  },

  build: {
    script: [
      'if test "{{hw.platform}}" = "darwin"; then',
      '  curl -L "$PATCH1" | patch',
      'fi',
      '',
      'if test "{{hw.platform}}" = "darwin"; then',
      '  curl -L "$PATCH2" | patch',
      'fi',
      '',
      'sed -i "s|@PREFIX@/share/openssh|{{prefix}}/etc/ssh|g" sandbox-darwin.c',
      'sed -i "s|-fzero-call-used-regs=all|-fzero-call-used-regs=used|g" configure',
      './configure $CONFIGURE_ARGS',
      'sed -i "s|prefix=/usr/local|prefix={{prefix}}|g" Makefile',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs 1 install',
      'cd "{{prefix}}/bin"',
      'ln -s ssh slogin',
      'cd "{{prefix}}/etc/ssh"',
      'curl -L "$RES_SSHD" -o org.openssh.sshd.sb',
    ],
    env: {
      'PATCH1': 'https://raw.githubusercontent.com/Homebrew/patches/1860b0a745f1fe726900974845d1b0dd3c3398d6/openssh/patch-sandbox-darwin.c-apple-sandbox-named-external.diff',
      'PATCH2': 'https://raw.githubusercontent.com/Homebrew/patches/d8b2d8c2612fd251ac6de17bf0cc5174c3aab94c/openssh/patch-sshd.c-apple-sandbox-named-external.diff',
      'RES_SSHD': 'https://raw.githubusercontent.com/apple-oss-distributions/OpenSSH/OpenSSH-268.100.4/com.openssh.sshd.sb',
      'CONFIGURE_ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix="{{prefix}}"', '--libdir="{{prefix}}/lib"', '--sysconfdir={{prefix}}/etc/ssh', '--with-ldns', '--with-libedit', '--with-kerberos5', '--with-pam', '--with-ssl-dir={{deps.openssl.org.prefix}}', '--with-security-key-builtin'],
    },
  },
}
