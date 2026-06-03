import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "facebook.com/watchman",
  name: "watchman",
  programs: [
    "watchman",
    "watchman-diag",
    "watchman-make",
    "watchman-wait",
    "watchman-replicate-subscription",
    "watchmanctl",
  ],
  dependencies: {
    'facebook.com/edencommon': "*",
    'facebook.com/fb303': "*",
    'facebook.com/folly': "*",
    'fmt.dev': ">=9",
    'gflags.github.io': "^2",
    'google.com/glog': "^0.7",
    'libevent.org': "^2.1",
    'libsodium.org': "^1",
    'openssl.org': "^1.1",
    'pcre.org/v2': "^10",
    'python.org': "~3.11",
    linux: {
      'libcxx.llvm.org': 18,
      'gnu.org/gcc/libstdcxx': 14,
    },
  },
  buildDependencies: {
    'cmake.org': "*",
    'github.com/skystrife/cpptoml': "*",
    'facebook.com/fbthrift': "*",
    'facebook.com/mvfst': "*",
    'google.com/googletest': "*",
    'rust-lang.org': "*",
    linux: {
      'gnu.org/gcc': 14,
    },
  },
  distributable: {
    url: "https://github.com/facebook/watchman/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "mainfile=$(find . -name \"main.cpp\")\necho \"Found main.cpp at: $mainfile\"\noldline='auto state_dir = computeWatchmanStateDirectory(user);'\nnewline='const char* env_state_dir = getenv(\"WATCHMAN_STATE_DIR\"); auto state_dir = env_state_dir ? env_state_dir : computeWatchmanStateDirectory(user);'\nsed -i \"s/$oldline/$newline/\" \"$mainfile\"\ncat $mainfile",
        'working-directory': "watchman",
      },
      {
        run: "if test -f Cargo.toml; then\n  sed -i 's/watchman_client = { version = \".*\", path/watchman_client = { path/' Cargo.toml\nfi\n",
        'working-directory': "watchman/cli",
      },
      "cmake -S . -B build $CMAKE_ARGS -DCMAKE_C_FLAGS=\"$CFLAGS\" -DCMAKE_CXX_FLAGS=\"$CXXFLAGS\"",
      "cmake --build build",
      "cmake --install build",
      "mkdir -p {{prefix}}/var/run/watchman",
    ],
    env: {
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX=\"{{prefix}}",
        "-DCMAKE_INSTALL_LIBDIR=lib",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_FIND_FRAMEWORK=LAST",
        "-DCMAKE_VERBOSE_MAKEFILE=ON",
        "-Wno-dev",
        "-DBUILD_TESTING=OFF",
        "-DENABLE_EDEN_SUPPORT=ON",
        "-DWATCHMAN_VERSION_OVERRIDE={{version}}",
        "-DPython3_EXECUTABLE={{deps.python.org.prefix}}/bin/python",
        "-DUSE_SYS_PYTHON=OFF",
      ],
      linux: {
        CC: "gcc",
        CXX: "g++",
        LD: "g++",
        LDFLAGS: "-Wl,-lpython{{deps.python.org.version.marketing}},-lstdc++",
        CMAKE_ARGS: [
          "-DCMAKE_EXE_LINKER_FLAGS=-Wl,-pie,-lstdc++",
        ],
      },
      darwin: {
        CMAKE_ARGS: [
          "-DCMAKE_EXE_LINKER_FLAGS=-Wl,-dead_strip_dylibs",
        ],
      },
    },
  },
  test: {
    script: [
      "if [ -f /etc/os-release ] && grep -q '^ID=arch' /etc/os-release; then\n  echo \"Arch Linux detected! Not currenlty testable.\"\n  exit 0\nfi\n",
      "watchman --version",
      "watchman -v | grep {{version}}",
      "watchman watch $ARGS .",
      "kill $(cat pid)",
      "cat state | grep {{version}}",
    ],
  },
}
