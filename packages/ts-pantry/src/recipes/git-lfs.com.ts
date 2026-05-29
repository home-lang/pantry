import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git-lfs.com',
  name: 'git-lfs',
  description: 'Git extension for versioning large files',
  homepage: 'https://git-lfs.github.com/',
  github: 'https://github.com/git-lfs/git-lfs',
  programs: ['git-lfs'],
  versionSource: {
    type: 'github-releases',
    repo: 'git-lfs/git-lfs',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/git-lfs/git-lfs/releases/download/v{{version}}/git-lfs-v{{version}}.tar.gz',
    stripComponents: 1,
  },

  // git-lfs is shipped vendored (prebuilt binaries) by upstream/pkgx:
  // building from source dies on signal 11 (see git-lfs#from-source FIXME in
  // pkgx). The build script downloads the platform-specific prebuilt binary
  // via $DOWNLOAD_URL / $UNARCHIVE defined in build.env below.
  dependencies: {
    'git-scm.org': '*',
  },
  buildDependencies: {
    'gnu.org/wget': '*',
  },

  build: {
    env: {
      'linux/x86-64': {
        DOWNLOAD_URL: 'https://github.com/git-lfs/git-lfs/releases/download/v{{version}}/git-lfs-linux-amd64-v{{version}}.tar.gz',
        UNARCHIVE: 'tar -xz -f git-lfs-linux-amd64-v{{version}}.tar.gz',
      },
      'linux/aarch64': {
        DOWNLOAD_URL: 'https://github.com/git-lfs/git-lfs/releases/download/v{{version}}/git-lfs-linux-arm64-v{{version}}.tar.gz',
        UNARCHIVE: 'tar -xz -f git-lfs-linux-arm64-v{{version}}.tar.gz',
      },
      'darwin/x86-64': {
        DOWNLOAD_URL: 'https://github.com/git-lfs/git-lfs/releases/download/v{{version}}/git-lfs-darwin-amd64-v{{version}}.zip',
        UNARCHIVE: 'unzip git-lfs-darwin-amd64-v{{version}}.zip -d ./',
      },
      'darwin/aarch64': {
        DOWNLOAD_URL: 'https://github.com/git-lfs/git-lfs/releases/download/v{{version}}/git-lfs-darwin-arm64-v{{version}}.zip',
        UNARCHIVE: 'unzip git-lfs-darwin-arm64-v{{version}}.zip -d ./',
      },
    },
    script: [
      'wget $DOWNLOAD_URL',
      '$UNARCHIVE',
      'cd git-lfs-{{version}}',
      'mkdir -p {{prefix}}/bin',
      'install ./git-lfs {{prefix}}/bin/git-lfs',
      'mkdir -p {{prefix}}/man',
      'mv ./man/* {{prefix}}/man/',
    ],
  },
}
