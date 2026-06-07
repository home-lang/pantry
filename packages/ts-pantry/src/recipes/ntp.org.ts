import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ntp.org',
  name: 'ntp',
  programs: ['ntpq', 'sntp', 'ntp-keygen', 'ntp-wait', 'ntpd', 'ntpdate', 'ntpdc', 'ntptime', 'ntptrace', 'update-leap'],
  distributable: {
    url: 'https://www.eecis.udel.edu/~ntp/ntp_spool/ntp4/ntp-4.2/ntp-4.2.8p17.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^3',
  },
  buildDependencies: {
    'perl.org': '^5',
  },

  build: {
    script: [
      {
        run: 'sed -i.bak \'s_^#!.*perl_#!{{deps.perl.org.prefix}}/bin/perl_\' nl.pl',
        'working-directory': 'ntpdc',
      },
      './configure --disable-debug --disable-dependency-tracking --disable-silent-rules --prefix={{prefix}} --with-openssl-libdir={{deps.openssl.org.prefix}}/lib --with-openssl-incdir={{deps.openssl.org.prefix}}/include --with-net-snmp-config=no',
      {
        run: 'LDADD_LIBNTP="-undefined dynamic_lookup $LDADD_LIBNTP"',
        if: 'darwin',
      },
      'make install LDADD_LIBNTP="$LDADD_LIBNTP"',
    ],
    env: {
      'LDADD_LIBNTP': '-lresolv',
      linux: {
        CFLAGS: '$CFLAGS -Wno-int-conversion',
      },
    },
  },
}
