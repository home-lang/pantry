import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'bittensor.com',
  name: 'Bittensor',
  description: 'Internet-scale Neural Networks',
  homepage: 'https://www.bittensor.com/',
  github: 'https://github.com/opentensor/bittensor',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'opentensor/bittensor',
  },
  distributable: {
    url: 'https://github.com/opentensor/bittensor/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'pkgx.sh': '>=1',
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'python.org': '~3.11',
    'cmake.org': '3',
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install .',
      'bkpyvenv seal {{prefix}} btcli',
      'python -m pip install --no-deps --force-reinstall --no-cache-dir -v --no-binary :all: --prefix={{prefix}} bittensor_drand',
      'python -m pip install --no-deps --force-reinstall --no-cache-dir -v --no-binary :all: --prefix={{prefix}} bittensor_wallet',
      'pip install . --prefix={{prefix}} --no-build-isolation',
      'ln -s python{{deps.python.org.version.marketing}} {{prefix}}/lib/python{{deps.python.org.version.major}}',
      'cd "{{prefix}}/lib/python{{deps.python.org.version.marketing}}/site-packages"',
      'if test "{{hw.platform}}" = "darwin"; then',
      '  pkgx +openssl.org^3',
      '  cp -a {{pkgx.prefix}}/openssl.org/v3/lib/* {{prefix}}/lib/',
      '  otool -l bittensor_wallet/bittensor_wallet.cpython-311-darwin.so | grep -C5 openssl || true',
      '  install_name_tool -change ${HOMEBREW_PREFIX}/opt/openssl@3/lib/libssl.3.dylib {{prefix}}/lib/libssl.3.dylib bittensor_wallet/bittensor_wallet.cpython-311-darwin.so',
      '  install_name_tool -change ${HOMEBREW_PREFIX}/opt/openssl@3/lib/libcrypto.3.dylib {{prefix}}/lib/libcrypto.3.dylib bittensor_wallet/bittensor_wallet.cpython-311-darwin.so',
      '  otool -l bittensor_wallet/bittensor_wallet.cpython-311-darwin.so | grep -C5 openssl || true',
      'fi',
      '',
    ],
  },
}
