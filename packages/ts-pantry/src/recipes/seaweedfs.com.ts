import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'seaweedfs.com',
  name: 'SeaweedFS',
  description: 'SeaweedFS is a fast distributed storage system for blobs, objects, files, and data lake, for billions of files! Blob store has O(1) disk seek, cloud tiering. Filer supports Cloud Drive, cross-DC active-active replication, Kubernetes, POSIX FUSE mount, S3 API, S3 Gateway, Hadoop, WebDAV, encryption, Erasure Coding.',
  homepage: 'https://seaweedfs.com',
  github: 'https://github.com/seaweedfs/seaweedfs',
  programs: ['weed'],
  versionSource: {
    type: 'github-releases',
    repo: 'seaweedfs/seaweedfs',
  },
  distributable: {
    url: 'https://github.com/seaweedfs/seaweedfs/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '=1.22.0',
  },

  build: {
    script: [
      {
        // 3.86 shipped with the wrong version
        run: 'find . -name constants.go -exec sed -i -f $PROP {} \\;',
        'working-directory': 'weed/util',
        prop: 's/MAJOR_VERSION  = int32.*/MAJOR_VERSION  = int32({{version.major}})/\ns/MINOR_VERSION  = int32.*/MINOR_VERSION  = int32({{version.minor}})/\n',
      },
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/weed ./weed',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X ariga.io/seaweedfs/cmd/seaweedfs/internal/cmdapi.version=v{{version}}'],
      // platform array values supplement the base GO_LDFLAGS (brewkit semantics).
      // -buildmode=pie on linux or segmentation fault
      // https://github.com/docker-library/golang/issues/402#issuecomment-982204575
      'linux': {
        GO_LDFLAGS: ['-buildmode=pie'],
      },
    },
  },
}
