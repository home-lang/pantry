import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'flutter.dev',
  name: 'flutter',
  description: 'Flutter makes it easy and fast to build beautiful apps for mobile and beyond',
  homepage: 'https://flutter.dev',
  github: 'https://github.com/flutter/flutter',
  programs: ['flutter', 'dart'],
  platforms: ['darwin', 'linux/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'flutter/flutter',
  },
  dependencies: {
    'git-scm.org': '*',
    'tukaani.org/xz': '*',
    'gnu.org/which': '*', // flutter create uses which
    linux: {
      'curl.se': '*',
      'info-zip.org/zip': '*',
      'info-zip.org/unzip': '*',
    },
  },

  build: {
    workingDirectory: '{{prefix}}',
    env: {
      linux: {
        DIST: 'https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_{{version}}-stable.tar.xz',
      },
      'darwin/aarch64': {
        DIST: 'https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_{{version}}-stable.zip',
      },
      'darwin/x86-64': {
        DIST: 'https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_{{version}}-stable.zip',
      },
    },
    script: [
      {
        run: 'curl -L "$DIST" | tar Jxf -',
        if: 'linux',
      },
      {
        run: [
          'curl -o flutter_darwin.zip "$DIST"',
          'unzip flutter_darwin.zip',
          'rm flutter_darwin.zip',
        ],
        if: 'darwin',
      },
      {
        run: [
          'ln -s ../flutter/bin/flutter flutter',
          'ln -s ../flutter/bin/dart dart',
        ],
        'working-directory': '{{prefix}}/bin',
      },
    ],
  },
}
