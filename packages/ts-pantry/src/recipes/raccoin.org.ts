import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'raccoin.org',
  name: 'raccoin',
  description: 'Crypto Portfolio and Tax Reporting Tool',
  homepage: 'https://raccoin.org/',
  github: 'https://github.com/bjorn/raccoin',
  programs: ['raccoin'],
  versionSource: {
    type: 'github-releases',
    repo: 'bjorn/raccoin',
    // Exclude v0.1.0: it pins an old Slint UI toolkit that no longer compiles
    // on current Rust (the generated appwindow.rs fails to build). Only
    // v0.2.0+ builds, so match 0.2.0 and up.
    tagPattern: /^v(0\.(?:[2-9]|\d\d)\..+|[1-9]\d*\..+)$/,
  },
  distributable: {
    url: 'https://github.com/bjorn/raccoin/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/libiconv': '^1',
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },

  build: {
    // raccoin doesn't provide any testability without a UI, so we add some.
    script: [
      {
        run: [
          'sed -i \\',
          '    -e\'1a\\',
          'const VERSION: &str = "{{version}}";\' \\',
          'main.rs',
        ],
        'working-directory': 'src',
      },
      {
        run: [
          'sed -i \\',
          '    -e\'/let portfolio_file: PathBuf = portfolio_file.into();/i\\',
          '        if portfolio_file == "--version" {\\',
          '            println!("raccoin v{VERSION}");\\',
          '            return Ok(());\\',
          '        }\' \\',
          'main.rs',
        ],
        if: '<0.2.0',
        'working-directory': 'src',
      },
      {
        run: [
          'sed -i \\',
          '    -e\'/let Some(portfolio_file)/i\\',
          '    if let Some(arg1) = env::args_os().nth(1) {\\',
          '        if arg1 == "--version" {\\',
          '            println!("raccoin v{VERSION}");\\',
          '            return Ok(());\\',
          '        }\\',
          '    }\' \\',
          'main.rs',
        ],
        if: '>=0.2.0',
        'working-directory': 'src',
      },
      'cargo install --locked --path . --root {{prefix}}',
    ],
    env: {
      linux: {
        LD: 'clang',
      },
    },
  },
}
