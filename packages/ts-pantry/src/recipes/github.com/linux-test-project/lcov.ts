import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/linux-test-project/lcov",
  name: "lcov",
  programs: [
    "lcov",
    "geninfo",
    "genhtml",
    "gendesc",
    "genpng",
  ],
  dependencies: {
    'perl.org': ">=5",
    'python.org': 3,
  },
  buildDependencies: {
    'cpanmin.us': "^1",
  },
  distributable: {
    url: "https://github.com/linux-test-project/lcov/releases/download/v{{ version.raw }}/lcov-{{ version.raw }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cpanm -l {{prefix}} $PKGS --notest --force",
      "make --jobs {{ hw.concurrency }} $ARGS install",
      "fix-shebangs.ts {{prefix}}/bin/*",
      {
        run: "if test -d lcov; then\n  mv lcov/* perl5/\n  rmdir lcov\n  ln -s perl5 lcov\nfi\n",
        if: ">=2",
        'working-directory': "${{prefix}}/lib",
      },
      {
        run: "chmod -Rf +w *",
        'working-directory': "${{prefix}}/lib/perl5",
      },
      {
        run: "sed -i -e '2i use File::Basename qw(dirname);' -e 's|{{prefix}}|dirname($0) . /..|g' ../lib/perl5/lcovutil.pm *",
        'working-directory': "${{prefix}}/bin",
      },
    ],
    env: {
      PKGS: [
        "Capture::Tiny",
        "DateTime",
        "DateTime::Locale",
        "Devel::Cover",
        "Digest::MD5",
        "ExtUtils::Helpers",
        "File::Find",
        "File::Spec",
        "IPC::System::Simple",
        "JSON::XS",
        "Module::Build::Tiny",
        "Readonly",
        "Time::HiRes",
      ],
      linux: {
        PKGS: [
          "Memory::Process",
        ],
      },
      ARGS: [
        "PREFIX={{prefix}}",
        "BIN_DR={{prefix}}/bin",
      ],
    },
  },
  test: {
    script: [
      "mv $FIXTURE hello_world.c",
      "cc -g -O2 --coverage -o hello_world hello_world.c",
      "./hello_world",
      "lcov --gcov-tool gcov --directory . --capture --output-file all_coverage.info",
      "test -f all_coverage.info",
      "grep hello_world.c all_coverage.info",
    ],
  },
}
