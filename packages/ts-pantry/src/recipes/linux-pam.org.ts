import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'linux-pam.org',
  name: 'linux-pam',
  description: 'Linux PAM (Pluggable Authentication Modules for Linux) project',
  github: 'https://github.com/linux-pam/linux-pam',
  programs: ['faillock', 'mkhomedir_helper', 'pam_namespace_helper', 'pam_timestamp_check', 'unix_chkpwd'],
  versionSource: {
    type: 'github-releases',
    repo: 'linux-pam/linux-pam',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/linux-pam/linux-pam/releases/download/v{{version}}/Linux-PAM-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
