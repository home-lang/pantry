import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
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
  },

  build: {
    script: [
      'sed -i \'s/GO_LD_EXTRAFLAGS :=/GO_LD_EXTRAFLAGS :=-buildmode=pie /\' Makefile',
      'make $ARGS',
      'install -D _output/bin/{{hw.platform}}_${ARCH}/oc {{prefix}}/bin/oc',
    ],
    env: {
      'ARGS': ['cross-build-{{hw.platform}}-${ARCH}', 'OS_GIT_VERSION={{version}}'],
    },
  },
}
