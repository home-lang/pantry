import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gnu.org/gcc/libgomp",
  name: "libgomp",
  programs: [],
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
        run: "if test \"{{hw.platform}}/{{hw.arch}}\" = \"darwin/x86-64\"; then\npatch -p1 < props/disable-cfi-x86-64-darwin.patch\nif test {{version.major}} -ge 16; then\npatch -p1 < props/disable-msabi-darwin-v16.patch\nelse\npatch -p1 < props/disable-msabi-darwin.patch\nfi\npatch -p1 < props/remove-old-frame-symbols-darwin.patch\nfi",
        if: ">=15.2",
        'working-directory': "..",
      },
      {
        run: "export ARGS=($ARGS --with-boot-ldflags=\"-static-libstdc++ -static-libgcc $LDFLAGS\")",
        if: "linux",
      },
      {
        run: "export ARGS=($ARGS)",
        if: "darwin",
      },
      {
        run: "export LDFLAGS_FOR_TARGET=\"$LDFLAGS\"",
        if: "darwin",
      },
      "../configure \"${ARGS[@]}\"",
      "make all-target-libgomp --jobs {{ hw.concurrency }}",
      "make install-target-libgomp",
      {
        run: "sed -e 's|@TARGET@|{{hw.target}}|g' -e 's|@VERSION@|{{version.raw}}|g' \"$PROP\" | tee gomp.pc",
        'working-directory': "{{prefix}}/lib/pkgconfig",
      },
      {
        run: "mv lib64/* lib/\nrmdir lib64\nln -sf lib lib64",
        if: "linux",
        'working-directory': "{{prefix}}",
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
      BRANCH133: "https://github.com/iains/gcc-13-branch/archive/refs/heads/gcc-13-3-darwin-pre-0.tar.gz",
      BRANCH134: "https://github.com/iains/gcc-13-branch/archive/refs/heads/gcc-13-4-darwin-p0.tar.gz",
      BRANCH141: "https://github.com/iains/gcc-14-branch/archive/refs/heads/gcc-14-1-darwin-pre-0.tar.gz",
      BRANCH142: "https://github.com/iains/gcc-14-branch/archive/refs/heads/gcc-14-2-darwin-pre-0.tar.gz",
      BRANCH143: "https://github.com/iains/gcc-14-branch/archive/refs/heads/gcc-14-3-darwin-pre-0.tar.gz",
      BRANCH151: "https://github.com/iains/gcc-15-branch/archive/refs/heads/gcc-15-1-darwin-rc1.tar.gz",
      BRANCH152: "https://github.com/iains/gcc-15-branch/archive/refs/heads/gcc-15-2-darwin-pre-0.tar.gz",
      BRANCH161: "https://github.com/iains/gcc-darwin-arm64/archive/refs/heads/master-wip-apple-si-on-r16-8803-g376d03b7b44da2.tar.gz",
      ARGS: [
        "--prefix={{ prefix }}",
        "--libdir={{ prefix }}/lib",
        "--enable-languages=c,c++",
        "--with-bugurl=\"https://github.com/pkgxdev/pantry/issues\"",
        "--disable-bootstrap",
        "--disable-nls",
        "--with-system-zlib",
      ],
      linux: {
        ARGS: [
          "--disable-multilib",
          "--enable-default-pie",
          "--enable-pie-tools",
          "--enable-host-pie",
        ],
      },
      'linux/x86-64': {
        LIBDIR: "lib64",
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
      'linux/aarch64': {
        LIBDIR: "lib64",
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
      "pkg-config --exists gomp",
      "pkg-config --modversion gomp",
      "if test \"$(sw_vers -productVersion | cut -d . -f 1)\" -lt 15; then\n  exit 0\nfi\n",
      "gcc $CFLAGS \"$FIXTURE\" -o test -lgomp $LDFLAGS",
      "./test",
    ],
  },
}
