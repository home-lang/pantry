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
    // OpenSSH 10.x uses APIs removed in OpenSSL 4; keep headers and libraries
    // on the supported OpenSSL 3 ABI throughout the build and runtime graph.
    // Resolve this direct crypto dependency before optional libraries whose
    // self-contained artifacts also carry an older libcrypto with the same ID.
    'openssl.org': '^3',
    'nlnetlabs.nl/ldns': '*',
    'developers.yubico.com/libfido2': '*',
    'kerberos.org': '*',
    'thrysoee.dk/editline': '*',
    'github.com/besser82/libxcrypt': '*',
    'zlib.net': '*',
    'linux': {
      'linux-pam.org': '*',
    },
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'curl.se': '*',
    'darwin': {
      'gnu.org/patch': '*',
    },
    'linux': {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },

  build: {
    script: [
      {
        run: [
          'if test {{hw.platform}} = "darwin"; then',
          '  curl -L "$PATCH1" | patch',
          'fi',
        ],
        if: '<10.1',
      },
      {
        run: [
          'if test {{hw.platform}} = "darwin"; then',
          '  curl -L "$PATCH2" | patch',
          'fi',
        ],
        if: '<9.8',
      },
      'sed -i "s|@PREFIX@/share/openssh|{{prefix}}/etc/ssh|g" sandbox-darwin.c',
      {
        run: 'sed -i "s|-fzero-call-used-regs=all|-fzero-call-used-regs=used|g" configure',
        if: 'darwin/x86-64',
      },
      './configure $CONFIGURE_ARGS',
      {
        run: 'sed -i "s|prefix=/usr/local|prefix={{prefix}}|g" Makefile',
        if: 'linux',
      },
      // Upstream exposes SSH_PROGRAM as a make variable. Client subprocesses
      // use execvp, so the Pantry environment selects its managed ssh after
      // relocation instead of an absolute path in the build worker.
      'make --jobs {{hw.concurrency}} SSH_PROGRAM=ssh',
      'make --jobs 1 SSH_PROGRAM=ssh install',
      {
        run: 'ln -s ssh slogin',
        'working-directory': '{{prefix}}/bin',
      },
      {
        run: 'curl -L "$RES_SSHD" -o org.openssh.sshd.sb',
        'working-directory': '{{prefix}}/etc/ssh',
      },
    ],
    env: {
      'PATCH1': 'https://raw.githubusercontent.com/Homebrew/patches/1860b0a745f1fe726900974845d1b0dd3c3398d6/openssh/patch-sandbox-darwin.c-apple-sandbox-named-external.diff',
      'PATCH2': 'https://raw.githubusercontent.com/Homebrew/patches/d8b2d8c2612fd251ac6de17bf0cc5174c3aab94c/openssh/patch-sshd.c-apple-sandbox-named-external.diff',
      'RES_SSHD': 'https://raw.githubusercontent.com/apple-oss-distributions/OpenSSH/OpenSSH-268.100.4/com.openssh.sshd.sb',
      'CONFIGURE_ARGS': ['--disable-debug', '--disable-dependency-tracking', '--prefix={{prefix}}', '--libdir={{prefix}}/lib', '--sysconfdir={{prefix}}/etc/ssh', '--with-ldns', '--with-libedit', '--with-kerberos5', '--with-pam', '--with-ssl-dir={{deps.openssl.org.prefix}}', '--with-security-key-builtin'],
      'linux': {
        'CONFIGURE_ARGS': '--with-privsep-path={{prefix}}/var/lib/sshd',
      },
      'darwin': {
        'CPPFLAGS': '$CPPFLAGS -D__APPLE_SANDBOX_NAMED_EXTERNAL__',
      },
    },
  },
  test: {
    required: true,
    script: [
      `probe=$(mktemp -d)
trap 'rm -rf "$probe"' EXIT
mkdir "$probe/clients" "$probe/transport"
printf '#!/bin/sh\nprintf "%%s\\n" "$@" > "$PANTRY_SSH_PROBE"\nexit 73\n' > "$probe/transport/ssh"
chmod +x "$probe/transport/ssh"
printf 'portable client probe\\n' > "$probe/input"
export PANTRY_SSH_PROBE="$probe/transport-used"
for client in scp sftp; do
  cp "{{prefix}}/bin/$client" "$probe/clients/$client"
  rm -f "$PANTRY_SSH_PROBE"
  if [ "$client" = scp ]; then
    if PATH="$probe/transport:$PATH" "$probe/clients/scp" "$probe/input" pantry-probe.invalid:/copy; then exit 1; fi
  else
    if PATH="$probe/transport:$PATH" "$probe/clients/sftp" -b /dev/null pantry-probe.invalid; then exit 1; fi
  fi
  test -s "$PANTRY_SSH_PROBE"
  grep -q pantry-probe.invalid "$PANTRY_SSH_PROBE"
done`,
    ],
  },
}
