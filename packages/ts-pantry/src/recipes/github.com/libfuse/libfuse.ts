import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/libfuse/libfuse",
  name: "libfuse",
  programs: [],
  // libfuse is the Linux kernel FUSE userspace library; its meson.build aborts
  // with "libfuse does not support OS-X" on macOS (macFUSE is the mac analog).
  platforms: ['linux/x86-64', 'linux/aarch64'],
  buildDependencies: {
    'mesonbuild.com': "*",
    'ninja-build.org': "*",
    linux: {
      'gnu.org/gcc': '14',
      'gnu.org/gettext': "*",
    },
  },
  distributable: {
    url: "https://github.com/libfuse/libfuse/releases/download/fuse-{{version}}/fuse-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "if test \{{hw.arch}}\ = \"aarch64\" && test -n \"${PROP:-}\" && test -f \"$PROP\"; then sed -i -f \"$PROP\" include/fuse_kernel.h; fi\nsed -i 's/closefrom/fuse_closefrom/g' util/ulockmgr_server.c\n./configure $V2_ARGS\nmake -j {{hw.concurrency}}\nmake install",
        if: "<3",
        'working-directory': "$SRCROOT",
      },
      {
        run: "meson setup build $ARGS",
        if: ">=3",
        'working-directory': "$SRCROOT",
      },
      {
        run: "meson compile\nmeson install",
        if: ">=3",
        'working-directory': "build",
      },
      {
        run: "sed 's/Name: fuse3/Name: fuse/' fuse3.pc > fuse.pc\n",
        if: "^3",
        'working-directory': "${{prefix}}/lib/pkgconfig",
      },
    ],
    env: {
      ARGS: [
        "-Dudevrulesdir={{prefix}}/etc/udev/rules.d",
        "-Dinitscriptdir={{prefix}}/etc/init.d",
        "-Dsysconfdir={{prefix}}/etc",
        "-Duseroot=false",
        "--prefix={{prefix}}",
        "--libdir={{prefix}}/lib",
      ],
      V2_ARGS: [
        "--prefix={{prefix}}",
        "--sbindir={{prefix}}/sbin",
      ],
      UDEV_RULES_PATH: "${{prefix}}/etc/udev/rules.d",
      INIT_D_PATH: "${{prefix}}/etc/init.d",
      MOUNT_FUSE_PATH: "${{prefix}}/sbin",
    },
  },
  test: {
    script: [
      "cc $FIXTURE -lfuse -o test -D_FILE_OFFSET_BITS=64",
      "cc $FIXTURE -lfuse3 -o test",
      "test \"$(./test)\" = \"$(cat $FIXTURE)\"",
      "pkg-config --exists fuse",
    ],
  },
}
