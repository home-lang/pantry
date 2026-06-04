import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apache.org/apr',
  name: 'apr',
  description: 'Mirror of Apache Portable Runtime',
  github: 'https://github.com/apache/apr',
  programs: ['apr-1-config'],
  versionSource: {
    type: 'github-tags',
    repo: 'apache/apr',
  },
  distributable: {
    // dlcdn.apache.org only keeps the latest release; archive.apache.org keeps
    // every version, so it works for all the versions we build.
    url: 'https://archive.apache.org/dist/apr/apr-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',

      // Make the installed apr-1-config relocatable: replace the hard-coded
      // install prefix with a path derived from the script's own location.
      {
        'working-directory': '{{prefix}}/bin',
        run: [
          'sed -i.bak "s_{{prefix}}_\\$(cd \\$(dirname \\$0)/.. \\&\\& pwd)_g" apr-{{version.major}}-config',
          'rm apr-{{version.major}}-config.bak',
        ].join('\n'),
      },
      // Same relocation for apr_rules.mk, used by dependents (apr-util, httpd).
      {
        'working-directory': '{{prefix}}/build-1',
        run: [
          'sed -i.bak \\',
          '  -e "s_{{prefix}}_\\$(subst /bin/apr-{{version.major}}-config,,\\$(shell command -v apr-{{version.major}}-config))_g" \\',
          '  -e "s_${PKGX_DIR}_\\$(subst /apache.org/apr/v{{version}}/bin/apr-{{version.major}}-config,,\\$(shell command -v apr-{{version.major}}-config))_g" \\',
          '  apr_rules.mk',
          'rm apr_rules.mk.bak',
        ].join('\n'),
      },
      // Sanitize the buildkit compiler-wrapper path that configure records into
      // the installed config (apr_rules.mk's CC/CPP, apr-1-config, apr.exp).
      // apr-util reads these via --with-apr and inherits CPP="<wrapper>/cc -E";
      // the wrapper path only exists inside apr's transient buildkit sandbox, so
      // apr-util's C-preprocessor sanity check fails. Replace any recorded
      // ".../_cc_wrapper/cc" (or "/var/buildkit/.../cc") with a plain "cc".
      {
        'working-directory': '{{prefix}}',
        run: [
          'find . -type f \\( -name apr_rules.mk -o -name "apr-{{version.major}}-config" -o -name apr.exp -o -name "*.mk" -o -name "*-config" \\) \\',
          '  -exec sed -i -E "s#[^ \\"]*/_cc_wrapper/cc#cc#g; s#/var/buildkit[^ \\"]*/cc#cc#g" {} +',
        ].join('\n'),
      },
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
      ],
    },
  },
}
