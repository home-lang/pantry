import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "coder.com/code-server",
  name: "code-server",
  programs: [
    "code-server",
  ],
  dependencies: {
    'nodejs.org': 22,
    linux: {
      'gnome.org/libsecret': "^0.21",
      'x.org/x11': "^1.8",
      'x.org/xkbfile': "^1.1",
      'kerberos.org': "^1.21",
    },
  },
  buildDependencies: {
    'npmjs.com': "*",
    'python.org': ">=3.11",
  },
  distributable: {
    url: "https://registry.npmjs.org/code-server/-/code-server-{{version}}.tgz",
    stripComponents: 1,
  },
  build: {
    script: [
      "npm i $ARGS .",
      "npm i -ddd --unsafe-perm $PKGS",
      {
        run: "cp -a $SRCROOT/* .",
        'working-directory': "{{prefix}}/libexec",
      },
      {
        run: "ln -s ../libexec/out/node/entry.js code-server",
        'working-directory': "{{prefix}}/bin",
      },
    ],
    env: {
      ARGS: [
        "-ddd",
        "--unsafe-perm",
        "--legacy-peer-deps",
        "--omit=dev",
      ],
      PKGS: [
        "@microsoft/1ds-core-js",
        "minimist",
        "@vscode/spdlog",
        "yauzl",
      ],
      CXXFLAGS: [
        "-DNODE_API_EXPERIMENTAL_NOGC_ENV_OPT_OUT",
      ],
      linux: {
        CC: "clang",
        CXX: "clang++",
        LD: "clang",
        CXXFLAGS: [
          "-D__NO_INLINE__",
        ],
      },
    },
  },
  test: {
    script: [
      "code-server --version | grep {{version}}",
      "code-server --extensions-dir=. --install-extension ms-python.python -vvv\ncode-server --extensions-dir=. --list-extensions | grep ms-python.python",
      "code-server &",
      "PID=$!",
      "sleep 5",
      "curl http://localhost:$PORT/login",
      "kill $PID",
    ],
  },
}
