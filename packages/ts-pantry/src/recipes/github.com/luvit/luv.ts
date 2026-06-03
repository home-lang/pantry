import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/luvit/luv",
  name: "luv",
  programs: [],
  dependencies: {
    'libuv.org': "*",
  },
  buildDependencies: {
    'cmake.org': "*",
    'lua.org': "*",
    'luajit.org': "*",
    linux: {
      'curl.se': "*",
    },
  },
  distributable: {
    url: "https://github.com/luvit/luv/archive/{{version}}-0.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "curl -L \"$lua_compact\" | tar -xz --strip-component=1",
        'working-directory': "deps/lua-compat-5.3",
      },
      "cmake -S . -B buildjit $CMAKE_ARGS -DWITH_LUA_ENGINE=LuaJIT -DBUILD_STATIC_LIBS=ON -DBUILD_SHARED_LIBS=ON",
      "cmake --build buildjit",
      "cmake --install buildjit",
      "cmake -S . -B buildlua $CMAKE_ARGS -DWITH_LUA_ENGINE=Lua -DBUILD_STATIC_LIBS=OFF -DBUILD_SHARED_LIBS=OFF",
      "cmake --build buildlua",
      "cmake --install buildlua",
      {
        run: "ln -s {{deps.lua.org.version.marketing}} {{deps.lua.org.version.major}}\n",
        'working-directory': {{prefix}}/lib/lua,
      },
    ],
    env: {
      lua_compact: "https://github.com/keplerproject/lua-compat-5.3/archive/v0.10.tar.gz",
      CMAKE_ARGS: [
        "-DCMAKE_INSTALL_PREFIX=\{{prefix}},
        "-DCMAKE_INSTALL_LIBDIR=lib",
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_FIND_FRAMEWORK=LAST",
        "-DCMAKE_VERBOSE_MAKEFILE=ON",
        "-Wno-dev",
        "-DBUILD_TESTING=OFF",
        "-DWITH_SHARED_LIBUV=ON",
        "-DLUA_BUILD_TYPE=System",
        "-DLUA_COMPAT53_DIR=$SRCROOT/deps/lua-compat-5.3",
        "-DBUILD_MODULE=ON",
      ],
    },
  },
  test: {
    script: [
      "pkg-config --modversion libluv | grep {{version}}",
      "lua test.lua | grep 'Sleeping'",
      "lua test.lua | grep 'Awake!'",
    ],
  },
}
