import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "macfuse.github.io/v2",
  name: "v2",
  programs: [],
  buildDependencies: {
    'git-scm.org': "^2",
    'gnu.org/autoconf': "*",
    'gnu.org/automake': "*",
    'gnu.org/libtool': "*",
    'gnu.org/gettext': "*",
    'curl.se': "*",
  },
  distributable: {
    url: "git+https://github.com/macfuse/macfuse.git",
  },
  build: {
    script: [
      "git submodule update --init --recursive",
      {
        run: "DMG_DIR=$(mktemp -d)\ncurl -LSsf https://github.com/macfuse/macfuse/releases/download/macfuse-{{version}}/macfuse-{{version}}.dmg -o $TMPDIR/macfuse.dmg\nhdiutil attach $TMPDIR/macfuse.dmg -nobrowse -mountpoint $DMG_DIR/dmg\npkgutil --expand \"$DMG_DIR/dmg/Install macFUSE.pkg\" $DMG_DIR/pkg\nhdiutil detach $DMG_DIR/dmg\ncd $DMG_DIR/pkg/Core.pkg && cat Payload | gunzip | cpio -id\ncp -a Library/Filesystems/macfuse.fs/Contents/Frameworks/MFMount.framework $SRCROOT/\ncd $SRCROOT\nrm -rf $DMG_DIR $TMPDIR/macfuse.dmg",
        if: ">=5.2",
      },
      {
        run: "./makeconf.sh\n./configure $ARGS\nmake -j {{ hw.concurrency }}\nmake install",
        'working-directory': "Library-2",
      },
      {
        run: "cp -a $SRCROOT/MFMount.framework .\ninstall_name_tool -change /Library/Filesystems/macfuse.fs/Contents/Frameworks/MFMount.framework/Versions/A/MFMount @loader_path/MFMount.framework/Versions/A/MFMount libfuse.2.dylib",
        if: ">=5.2",
        'working-directory': "${{prefix}}/lib/",
      },
    ],
    env: {
      UDEV_RULES_PATH: "${{prefix}}/etc/udev/rules.d",
      INIT_D_PATH: "${{prefix}}/etc/init.d",
      ARGS: [
        "--prefix={{prefix}}",
        "--disable-example",
      ],
      CFLAGS: "$CFLAGS -F$SRCROOT",
      LDFLAGS: "$LDFLAGS -F$SRCROOT",
    },
  },
  test: {
    script: [
      "cc $FIXTURE -lfuse -o test $CFLAGS",
      "./test",
      "pkg-config --exists fuse",
    ],
  },
}
