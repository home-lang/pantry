import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'openldap.org',
  name: 'ldap',
  description: 'Open source suite of directory software',
  homepage: 'https://www.openldap.org/software/',
  programs: ['ldapcompare', 'ldapdelete', 'ldapexop', 'ldapmodify', 'ldapmodrdn', 'ldappasswd', 'ldapsearch', 'ldapurl', 'ldapvc', 'ldapwhoami'],
  distributable: {
    url: 'https://www.openldap.org/software/download/OpenLDAP/openldap-release/openldap-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'gnu.org/sed': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      '',
      '# Avoid needing groff to build the docs',
      'sed -i.bak -e \'s/SUBDIRS=\\(.*\\)\\bdoc\\b\\(.*\\)/SUBDIRS=\\1\\2/\' Makefile',
      'rm Makefile.bak',
      '',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--enable-accesslog', '--enable-auditlog', '--enable-constraint', '--enable-dds', '--enable-deref', '--enable-dyngroup', '--enable-dynlist', '--enable-memberof', '--enable-ppolicy', '--enable-proxycache', '--enable-refint', '--enable-retcode', '--enable-seqmod', '--enable-translucent', '--enable-unique', '--enable-valsort', '--without-systemd'],
    },
  },
}
