import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rpm.org/rpm-sequoia',
  name: 'rpm-sequoia',
  programs: [],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.85',
  },
  distributable: {
    url: 'https://github.com/rpm-software-management/rpm-sequoia/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo build --release --no-default-features --features crypto-openssl',
      {
        run: 'install -Dm755 $SRCROOT/target/release/librpm_sequoia.so librpm_sequoia.so',
        'working-directory': '${{prefix}}/lib/',
      },
      {
        run: 'ln -s librpm_sequoia.so librpm_sequoia.so.1',
        if: 'linux',
        'working-directory': '${{prefix}}/lib',
      },
      {
        run: 'sed \'s|/usr/local|{{prefix}}|\' $SRCROOT/target/release/rpm-sequoia.pc >rpm-sequoia.pc',
        'working-directory': '${{prefix}}/lib/pkgconfig/',
      },
    ],
    env: {
      OPENSSL_DIR: '{{deps.openssl.org.prefix}}',
    },
  },
  test: {
    script: [
      'test -f {{prefix}}/lib/librpm_sequoia.so',
      'test -f {{prefix}}/lib/pkgconfig/rpm-sequoia.pc',
      'pkg-config --exists rpm-sequoia',
      'gcc -v $FIXTURE -o test_link $(pkg-config --cflags --libs rpm-sequoia)',
      './test_link',
    ],
  },
}
