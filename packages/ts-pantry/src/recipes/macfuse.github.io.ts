import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'macfuse.github.io',
  name: 'macfuse.github',
  description: 'macFUSE umbrella repository',
  github: 'https://github.com/macfuse/macfuse',
  programs: [],
  platforms: ['darwin'],
  versionSource: {
    type: 'github-releases',
    repo: 'macfuse/macfuse',
    tagPattern: /^macfuse-(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/macfuse/macfuse.git',
    ref: 'macfuse-{{version}}',
  },
  buildDependencies: {
    'mesonbuild.com': '*',
    'ninja-build.org': '*',
    'git-scm.org': '^2',
    'curl.se': '*',
  },

  build: {
    script: [
      'git submodule update --init --recursive',

      // extract MFMount.framework from the macFUSE release DMG
      // Library-3 links against it as of 5.2.0
      {
        run: [
          'DMG_DIR=$(mktemp -d)',
          'curl -LSsf https://github.com/macfuse/macfuse/releases/download/macfuse-{{version}}/macfuse-{{version}}.dmg -o $TMPDIR/macfuse.dmg',
          'hdiutil attach $TMPDIR/macfuse.dmg -nobrowse -mountpoint $DMG_DIR/dmg',
          'pkgutil --expand "$DMG_DIR/dmg/Install macFUSE.pkg" $DMG_DIR/pkg',
          'hdiutil detach $DMG_DIR/dmg',
          'cd $DMG_DIR/pkg/Core.pkg && cat Payload | gunzip | cpio -id',
          'cp -a Library/Filesystems/macfuse.fs/Contents/Frameworks/MFMount.framework $SRCROOT/',
          'cd $SRCROOT',
          'rm -rf $DMG_DIR $TMPDIR/macfuse.dmg',
        ],
        if: '>=5.2',
      },

      {
        run: [
          'meson setup .. $ARGS -Dc_args=-F$SRCROOT -Dc_link_args=-F$SRCROOT',
          'meson compile',
          'meson install',
        ],
        'working-directory': 'Library-3/build',
      },

      // bundle MFMount.framework and rewrite libfuse3's load path to use it
      {
        run: [
          'cp -a $SRCROOT/MFMount.framework .',
          'install_name_tool -change /Library/Filesystems/macfuse.fs/Contents/Frameworks/MFMount.framework/Versions/A/MFMount @loader_path/MFMount.framework/Versions/A/MFMount libfuse3.4.dylib',
        ],
        'working-directory': '${{prefix}}/lib/',
        if: '>=5.2',
      },

      {
        run: 'sed \'s/Name: fuse3/Name: fuse/\' fuse3.pc > fuse.pc',
        'working-directory': '${{prefix}}/lib/pkgconfig',
      },
    ],
    env: {
      ARGS: [
        '-Dudevrulesdir={{prefix}}/etc/udev/rules.d',
        '-Dinitscriptdir={{prefix}}/etc/init.d',
        '-Dsysconfdir={{prefix}}/etc',
        '-Duseroot=false',
        '--prefix={{prefix}}',
      ],
    },
  },
}
