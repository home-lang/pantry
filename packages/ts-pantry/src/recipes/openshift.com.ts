import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openshift.com',
  name: 'oc',
  description: 'The OpenShift Command Line, part of OKD',
  homepage: 'https://www.openshift.com/',
  github: 'https://github.com/openshift/oc',
  programs: ['oc'],
  versionSource: {
    type: 'github-releases',
    repo: 'openshift/oc',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://mirror.openshift.com/pub/openshift-v{{version.major}}/clients/ocp/{{version}}/openshift-client-src.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'kerberos.org': '^1.21',
  },
  buildDependencies: {
    'go.dev': '^1.21',
    linux: {
      'gnu.org/gcc': '14', // aarch64 wants `ld.gold`
      'gnu.org/binutils': '~2.44', // higher might no longer include ld.gold
    },
  },

  build: {
    script: [
      // linux builds like to segfault without -buildmode=pie
      {
        run: 'sed -i \'s/GO_LD_EXTRAFLAGS :=/GO_LD_EXTRAFLAGS :=-buildmode=pie /\' Makefile',
        if: 'linux',
      },
      'make $ARGS',
      'install -D _output/bin/{{hw.platform}}_${ARCH}/oc {{prefix}}/bin/oc',
    ],
    env: {
      // Without declaring ARCH, cross-build-{{hw.platform}}-${ARCH} will execute like cross-build-{{hw.platform}}-
      'ARGS': ['cross-build-{{hw.platform}}-${ARCH}', 'OS_GIT_VERSION={{version}}'],
      'linux': {
        // https://github.com/openshift/oc/issues/562
        ARGS: ['SHELL=/bin/bash'],
      },
      'x86-64': {
        ARCH: 'amd64',
      },
      'aarch64': {
        ARCH: 'arm64',
      },
    },
  },
}
