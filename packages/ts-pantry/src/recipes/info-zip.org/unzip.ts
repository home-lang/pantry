import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'info-zip.org/unzip',
  name: 'unzip',
  programs: [
    'funzip',
    'unzip',
    'unzipsfx',
    'zipgrep',
    'zipinfo',
  ],
  distributable: {
    url: 'https://cytranet.dl.sourceforge.net/project/infozip/UnZip {{ version.major }}.x (latest)/UnZip {{ version.raw }}/unzip{{ version.major }}{{version.minor }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'case {{ hw.platform }} in',
      'darwin) TARGET=macosx;;',
      'linux)',
      '  TARGET=macosx   #SURPRISE!',
      '  sed -i.bak -e \'875s/-DBSD/-DBSD -fPIC/\' unix/Makefile',
      '  rm unix/Makefile.bak',
      '  ;;',
      'esac',
      'make --file unix/Makefile --jobs {{ hw.concurrency }} $TARGET LD="$LD"',
      'make prefix={{prefix}} install',
    ],
    env: {
      darwin: {
        LD: 'cc',
      },
      linux: {
        LD: 'cc -pie',
      },
    },
  },
  test: {
    script: [
      'unzip -h',
    ],
  },
}
