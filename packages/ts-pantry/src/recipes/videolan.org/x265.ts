import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'videolan.org/x265',
  name: 'x265',
  programs: [
    'x265',
  ],
  buildDependencies: {
    'cmake.org': '*',
    'nasm.us': '*',
  },
  distributable: {
    url: 'http://ftp.videolan.org/pub/videolan/x265/x265_{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    // The x265 tarball does NOT ship 8bit/10bit/12bit dirs — only `source/`.
    // The multi-bit-depth build (mirrored from build/linux/multilib.sh) creates
    // these dirs (buildkit `working-directory` does `mkdir -p`), builds 10bit and
    // 12bit static libs in their own dirs, drops them into 8bit/, then builds the
    // 8bit lib linked against them and combines all into a single libx265.a.
    // cmake `../source` resolves to the tarball top-level `source/` from each dir.
    workingDirectory: '8bit',
    script: [
      // x265 4.1 and earlier ship `cmake_minimum_required(VERSION 2.8.8)` and
      // `cmake_policy(SET CMP0025/CMP0054 OLD)` in source/CMakeLists.txt. CMake 4.x
      // (what `cmake.org: '*'` resolves to, and the Homebrew cmake used on macOS)
      // removed compatibility with CMake < 3.5 AND removed those OLD policy
      // behaviors entirely, so the very first `cmake ../source` aborts at config
      // time (the ~9s CI failure). Upstream fixed this in x265 4.2 by using the
      // `2.8.8...3.10` range form and dropping the removed policies; mirror that
      // patch here so 4.1/older still configure under CMake 4.x. `sed -i.bak`
      // works on both GNU (Linux) and BSD (macOS) sed.
      {
        run: 'sed -i.bak -e "s/cmake_minimum_required (VERSION 2.8.8)/cmake_minimum_required (VERSION 3.5)/" -e "s/cmake_policy(SET CMP0025 OLD)/# CMP0025 removed in CMake 4/" -e "s/cmake_policy(SET CMP0054 OLD)/# CMP0054 removed in CMake 4/" ../source/CMakeLists.txt\nrm -f ../source/CMakeLists.txt.bak\n',
      },
      {
        run: 'cmake ../source -DENABLE_HDR10_PLUS=ON $ARGS_DEFAULT $HIGHBITARGS\nmake\nmv libx265.a ../8bit/libx265_main10.a\n',
        'working-directory': '../10bit',
      },
      {
        run: 'cmake ../source -DMAIN12=ON $ARGS_DEFAULT $HIGHBITARGS\nmake\nmv libx265.a ../8bit/libx265_main12.a\n',
        'working-directory': '../12bit',
      },
      {
        run: 'cmake ../source $ARGS_DEFAULT $ARGS\nmake\nmv libx265.a libx265_main.a\n',
      },
      {
        run: 'libtool -static -o $LIB_ARGS',
        if: 'darwin',
      },
      {
        // `ar crs libx265.a libx265_main.a ...` would *nest* the .a archives as
        // members rather than merge their .o object files, producing a broken
        // combined library that consumers cannot link against. Use the GNU ar
        // MRI script form (matching upstream build/linux/multilib.sh) to actually
        // merge the three archives into a single libx265.a.
        run: 'ar -M <<EOF\nCREATE libx265.a\nADDLIB libx265_main.a\nADDLIB libx265_main10.a\nADDLIB libx265_main12.a\nSAVE\nEND\nEOF\n',
        if: 'linux',
      },
      {
        run: 'make install',
      },
    ],
    env: {
      ARGS_DEFAULT: [
        '-DCMAKE_POLICY_VERSION_MINIMUM=3.5',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DENABLE_PIC=ON',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
      ],
      ARGS: [
        '-DLINKED_10BIT=ON',
        '-DLINKED_12BIT=ON',
        '-DEXTRA_LINK_FLAGS=-L.',
        '-DEXTRA_LIB=x265_main10.a;x265_main12.a',
      ],
      HIGHBITARGS: [
        '-DHIGH_BIT_DEPTH=ON',
        '-DEXPORT_C_API=OFF',
        '-DENABLE_SHARED=OFF',
        '-DENABLE_CLI=OFF',
      ],
      LIB_ARGS: [
        'libx265.a',
        'libx265_main.a',
        'libx265_main10.a',
        'libx265_main12.a',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion x265 | grep {{version.raw}}',
    ],
  },
}
