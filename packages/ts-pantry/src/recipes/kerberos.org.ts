import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kerberos.org',
  name: 'kerberos',
  // Keep MIT's products; private OpenSSL snapshots otherwise shadow a
  // consumer's declared ABI through unversioned linker names.
  publish: { include: ['bin/**', 'sbin/**', 'include/**', 'lib/libcom_err*', 'lib/libverto*', 'lib/libkadm*', 'lib/libkrad*', 'lib/libkrb5*', 'lib/libk5crypto*', 'lib/libkdb5*', 'lib/libgss*', 'lib/pkgconfig/**', 'share/**', 'COPY*', 'LICENSE*'] },
  description: 'mirror of MIT krb5 repository',
  github: 'https://github.com/krb5/krb5',
  programs: ['compile_et', 'gss-client', 'k5srvutil', 'kadmin', 'kdestroy', 'kinit', 'klist', 'kpasswd', 'krb5-config', 'kswitch', 'ktutil', 'kvno', 'sclient', 'sim_client', 'uuclient', 'gss-server', 'kadmin.local', 'kadmind', 'kdb5_util', 'kprop', 'kpropd', 'kproplog', 'krb5-send-pr', 'krb5kdc', 'sim_server', 'sserver', 'uuserver'],
  versionSource: {
    type: 'github-tags',
    repo: 'krb5/krb5',
    tagPattern: /^krb5-(\d+(?:\.\d+){0,3})-final$/,
  },
  distributable: {
    url: 'https://kerberos.org/dist/krb5/{{version.marketing}}/krb5-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'gnu.org/bison': '3',
  },

  build: {
    workingDirectory: 'src',
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-nls', '--without-system-verto', '--without-keyutils'],
    },
  },
}
