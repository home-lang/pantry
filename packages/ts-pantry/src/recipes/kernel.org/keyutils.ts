import type { Recipe } from '../../../scripts/recipe-types'

/** The upstream client ABI used by Kerberos and MySQL's authentication plugins. */
export const recipe: Recipe = {
  domain: 'kernel.org/keyutils', name: 'libkeyutils', programs: [], platforms: ['linux'],
  description: 'Linux key retention client library and development interface.',
  homepage: 'https://kernel.googlesource.com/pub/scm/linux/kernel/git/dhowells/keyutils/',
  versionSource: {
    type: 'custom',
    async fetch() {
      const response = await fetch('https://kernel.googlesource.com/pub/scm/linux/kernel/git/dhowells/keyutils/+refs/tags?format=JSON')
      if (!response.ok) throw new Error(`Keyutils version discovery failed: HTTP ${response.status}`)
      const body = await response.text()
      const refs = JSON.parse(body.slice(body.indexOf('\n') + 1)) as Record<string, unknown>
      const versions = Object.keys(refs).filter(tag => /^v\d+\.\d+\.\d+$/.test(tag)).map(tag => tag.slice(1))
      if (!versions.length) throw new Error('Keyutils upstream returned no stable release tags')
      return versions
    },
  },
  // kernel.googlesource.com is the kernel.org Git mirror. Its archive is rooted
  // directly in the selected upstream tag, without a containing directory.
  distributable: {
    url: 'https://kernel.googlesource.com/pub/scm/linux/kernel/git/dhowells/keyutils/+archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 0,
  },
  buildDependencies: {
    'gnu.org/make': '*', 'gnu.org/sed': '*', 'gnu.org/coreutils': '*',
    'gnu.org/binutils': '*', 'freedesktop.org/pkg-config': '*', 'kernel.org/linux-headers': '*',
  },
  build: {
    script: [
      'make --jobs {{hw.concurrency}} LIBDIR={{prefix}}/lib USRLIBDIR={{prefix}}/lib BUILDFOR=64-bit CFLAGS="${CFLAGS:-} -O2 -Wall -Werror" libkeyutils.so',
      'mkdir -p "{{prefix}}/lib/pkgconfig" "{{prefix}}/include" "{{prefix}}/share/licenses/libkeyutils"',
      'cp -a libkeyutils.so* "{{prefix}}/lib/"',
      'install -m644 keyutils.h "{{prefix}}/include/keyutils.h"',
      'install -m644 LICENCE.LGPL "{{prefix}}/share/licenses/libkeyutils/LICENCE.LGPL"',
      'sed -e "s|@VERSION@|{{version}}|g" -e "s|@libdir@|{{prefix}}/lib|g" -e "s|@includedir@|{{prefix}}/include|g" libkeyutils.pc.in > "{{prefix}}/lib/pkgconfig/libkeyutils.pc"',
    ],
  },
  test: {
    required: true,
    script: [
      'readelf --dynamic "{{prefix}}/lib/libkeyutils.so.1" | grep -F "[libkeyutils.so.1]"',
      'readelf --version-info "{{prefix}}/lib/libkeyutils.so.1" | grep -F KEYUTILS_1.0',
      'pkg-config --exists libkeyutils',
      'printf "#include <keyutils.h>\\nint main(void) { key_serial_t (*entry)(key_serial_t, int) = keyctl_get_keyring_ID; return entry == 0; }\\n" > probe.c',
      'cc probe.c $(pkg-config --cflags --libs libkeyutils) -o probe',
      './probe',
    ],
  },
}
