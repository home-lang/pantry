import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/gcc",
  name: "gcc",
  programs: [
    "ar",
    "cc",
    "c++",
    "gc++",
    "cpp",
    "g++",
    "gcc",
    "gcc-ar",
    "gcc-nm",
    "gcc-ranlib",
    "gcov",
    "gcov-dump",
    "gcov-tool",
    "gfortran",
    "nm",
    "ranlib",
  ],
  dependencies: {
    'gnu.org/binutils': "*",
    'gnu.org/gmp': ">=4.2",
    'gnu.org/mpfr': ">=2.4.0",
    'gnu.org/mpc': ">=0.8.0",
    'zlib.net': "^1.3",
    'darwin/x86-64': {
      'libisl.sourceforge.io': "^0",
    },
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': "*",
    },
    'gnu.org/make': "*",
    'perl.org': "^5.6.1",
    'gnu.org/patch': "*",
    'curl.se': "*",
    'github.com/westes/flex': "*",
  },
  distributable: {
    url: "https://ftp.gnu.org/gnu/gcc/gcc-{{version.raw}}/gcc-{{ version.raw }}.tar.xz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if test -n \"$PATCH{{version.major}}{{version.minor}}\"; then\ncurl \"$PATCH{{version.major}}{{version.minor}}\" | patch -p1\nfi",
        if: "darwin",
        'working-directory': "..",
      },
      {
        run: "if test -n \"$BRANCH{{version.major}}{{version.minor}}\"; then\ncurl -L \"$BRANCH{{version.major}}{{version.minor}}\" | tar xz --strip-components=1\nfi",
        if: "darwin/aarch64",
        'working-directory': "..",
      },
      {
        run: "if test \{{hw.platform}}/{{hw.arch}}\ = \"darwin/x86-64\"; then\npatch -p1 < props/disable-cfi-x86-64-darwin.patch\nif test {{version.major}} -ge 16; then\npatch -p1 < props/disable-msabi-darwin-v16.patch\nelse\npatch -p1 < props/disable-msabi-darwin.patch\nfi\npatch -p1 < props/remove-old-frame-symbols-darwin.patch\nfi",
        if: ">=15.2",
        'working-directory': "..",
      },
      "ARGS=($ARGS --with-pkgversion=\"pkgx GCC {{version}}\")",
      {
        run: "export ARGS=(\"${ARGS[@]}\" --with-boot-ldflags=\"-static-libstdc++ -static-libgcc $LDFLAGS\")",
        if: "linux",
      },
      {
        run: "if [ {{version.major}} -ge 6 ];  then ARGS=(\"${ARGS[@]}\" --enable-default-pie); fi\nif [ {{version.major}} -ge 9 ];  then ARGS=(\"${ARGS[@]}\" --enable-pie-tools); fi\nif [ {{version.major}} -ge 13 ]; then ARGS=(\"${ARGS[@]}\" --enable-host-pie); fi\nexport ARGS\n",
        if: "linux",
      },
      {
        run: "ARGS=(\"${ARGS[@]}\" --disable-lto --disable-plugin); export ARGS",
        if: "<10",
      },
      {
        run: "DEPRP=\{{deps.gnu.org/mpc.prefix}}/lib:{{deps.gnu.org/mpfr.prefix}}/lib:{{deps.gnu.org/gmp.prefix}}/lib:{{deps.zlib.net.prefix}}/lib\\nexport LDFLAGS=\"$LDFLAGS -Wl,-rpath,$DEPRP -Wl,-rpath-link,$DEPRP\"\n",
        if: "linux",
      },
      {
        run: "export LDFLAGS_FOR_TARGET=\"$LDFLAGS\"",
        if: "darwin",
      },
      "../configure \"${ARGS[@]}\"",
      "make --jobs {{ hw.concurrency }}",
      "make install",
      {
        run: "if [ {{version.major}} -lt 10 ]; then\n  for d in {{prefix}}/lib/gcc/*/{{version.raw}}/include-fixed; do\n    [ -d \"$d/bits\" ] || continue\n    mv \"$d/bits\" \"$d/bits.disabled-by-pantry\" || true\n    mkdir -p \"$d/bits\"\n  done\n  find {{prefix}}/lib/gcc -name 'libgcc*.a' -o -name 'crt*.o' 2>/dev/null | while read f; do\n    {{deps.gnu.org/binutils.prefix}}/bin/strip --strip-debug \"$f\" 2>/dev/null || true\n  done\nfi\n",
        if: "linux",
      },
      {
        run: "test -f gc++ || ln -sf c++ gc++",
        'working-directory': "${{prefix}}/bin",
      },
      {
        run: "ln -sf gcc cc\nln -sf ../../../binutils/v\\*/bin/ar ar\nln -sf ../../../binutils/v\\*/bin/nm nm\nln -sf ../../../binutils/v\\*/bin/ranlib ranlib",
        'working-directory': "${{prefix}}/bin",
      },
      {
        run: "codesign --remove-signature libgcc_s.1.1.dylib || true\ncodesign -s - --force libgcc_s.1.1.dylib\ncodesign --remove-signature libgcc_s.1.dylib || true\ncodesign -s - --force libgcc_s.1.dylib",
        if: "darwin/x86-64",
        'working-directory': "${{prefix}}/lib",
      },
    ],
    env: {
      PATCH122: "https://raw.githubusercontent.com/Homebrew/formula-patches/1d184289/gcc/gcc-12.2.0-arm.diff",
      PATCH131: "https://raw.githubusercontent.com/Homebrew/formula-patches/master/gcc/gcc-13.1.0.diff",
      BRANCH105: "https://github.com/iains/gcc-10-branch/archive/refs/heads/gcc-10-5Dr0-pre-0.tar.gz",
      BRANCH114: "https://github.com/iains/gcc-11-branch/archive/refs/tags/gcc-11.4-darwin-r0.tar.gz",
      BRANCH115: "https://github.com/iains/gcc-11-branch/archive/refs/tags/gcc-11.5-darwin-r0.tar.gz",
      BRANCH123: "https://github.com/iains/gcc-12-branch/archive/refs/tags/gcc-12.3-darwin-r0.tar.gz",
      BRANCH124: "https://github.com/iains/gcc-12-branch/archive/refs/heads/gcc-12-4-darwin.tar.gz",
      BRANCH125: "https://github.com/iains/gcc-12-branch/archive/refs/heads/gcc-12-4-darwin.tar.gz",
      BRANCH132: "https://github.com/iains/gcc-13-branch/archive/refs/heads/gcc-13-2-darwin.tar.gz",
      BRANCH133: "https://github.com/iains/gcc-13-branch/archive/refs/heads/gcc-13-3-darwin.tar.gz",
      BRANCH134: "https://github.com/iains/gcc-13-branch/archive/refs/heads/gcc-13-4-darwin-p0.tar.gz",
      BRANCH141: "https://github.com/iains/gcc-14-branch/archive/refs/heads/gcc-14-1-darwin.tar.gz",
      BRANCH142: "https://github.com/iains/gcc-14-branch/archive/refs/heads/gcc-14-2-darwin.tar.gz",
      BRANCH143: "https://github.com/iains/gcc-14-branch/archive/refs/heads/gcc-14-3-darwin-pre-0.tar.gz",
      BRANCH151: "https://github.com/iains/gcc-15-branch/archive/refs/heads/gcc-15-1-darwin-rc1.tar.gz",
      BRANCH152: "https://github.com/iains/gcc-15-branch/archive/refs/heads/gcc-15-2-darwin-pre-0.tar.gz",
      BRANCH161: "https://github.com/iains/gcc-darwin-arm64/archive/refs/heads/master-wip-apple-si-on-r16-8803-g376d03b7b44da2.tar.gz",
      ARGS: [
        "--prefix={{ prefix }}",
        "--libdir={{ prefix }}/lib",
        "--enable-languages=c,c++,objc,obj-c++,fortran",
        "--with-bugurl=\"https://github.com/pkgxdev/pantry/issues\"",
        "--disable-bootstrap",
        "--disable-nls",
        "--with-system-zlib",
      ],
      linux: {
        ARGS: [
          "--disable-multilib",
        ],
      },
      'linux/x86-64': {
        LDFLAGS: [
          "-pie",
        ],
        CFLAGS: [
          "-fPIC",
          "-fPIE",
        ],
        CXXFLAGS: [
          "-fPIC",
          "-fPIE",
        ],
      },
      darwin: {
        LDFLAGS: "$LDFLAGS -Wl,-headerpad_max_install_names",
        ARGS: [
          "--with-sysroot=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk",
        ],
      },
      'darwin/aarch64': {
        ARGS: [
          "--build=aarch64-apple-darwin20.0.0",
        ],
      },
      'darwin/x86-64': {
        ARGS: [
          "--build=x86_64-apple-darwin20.0.0",
        ],
        BOOT_CFLAGS: [
          "-Wa,-mmacos-version-min=10.5",
        ],
        CFLAGS_FOR_TARGET: [
          "-Wa,-mmacos-version-min=10.5",
        ],
        CXXFLAGS_FOR_TARGET: [
          "-Wa,-mmacos-version-min=10.5",
        ],
      },
    },
  },
  test: {
    script: [
      "gcc --version | grep -q \"pkgx GCC {{version}}\"",
      "gcc -print-libgcc-file-name",
      "gcc -print-multiarch",
      "if ! test -f /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/AvailabilityInternalLegacy.h || ! test -f ; then\necho \"Missing SDK; skipping remaining tests\"\nexit 0\nfi",
      "if test \{{hw.platform}}\ = \"darwin\" && ! test -f /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/_bounds.h || ! test -f ; then\necho \"Missing SDK; skipping remaining tests\"\nexit 0\nfi",
      "gcc -o test1 test.c -lgmp",
      "./test1",
      "g++ -o test2 test.cc",
      "test \"$(./test2)\" = \"Hello, world!\"",
      "gfortran -o test3 test.f90",
      "test \"$(./test3)\" = \"Hello, world!\"",
    ],
  },
}
