import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kerberos.org',
  name: 'kerberos',
  description: 'mirror of MIT krb5 repository',
  github: 'https://github.com/krb5/krb5',
  programs: ['compile_et', 'gss-client', 'k5srvutil', 'kadmin', 'kdestroy', 'kinit', 'klist', 'kpasswd', 'krb5-config', 'kswitch', 'ktutil', 'kvno', 'sclient', 'sim_client', 'uuclient', 'gss-server', 'kadmin.local', 'kadmind', 'kdb5_util', 'kprop', 'kpropd', 'kproplog', 'krb5-send-pr', 'krb5kdc', 'sim_server', 'sserver', 'uuserver'],
  versionSource: {
    type: 'github-releases',
    repo: 'krb5/krb5',
    tagPattern: /^krb5-(.+?)(?:-final)?$/,
  },
  distributable: {
    url: 'https://kerberos.org/dist/krb5/{{ version.marketing }}/krb5-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'gnu.org/bison': '3',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-nls', '--without-system-verto', '--without-keyutils'],
    },
  },
}
