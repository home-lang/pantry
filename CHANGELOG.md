[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.5...vv0.8.1)

### 🚀 Features

- resolve GitHub tags via API to fix leading-zero version normalization ([4e4a3df](https://github.com/home-lang/pantry/commit/4e4a3df)) _(by Chris <chrisbreuer93@gmail.com>)_
- add targeted build mode for fast CI testing, fix shell expansion bug ([51b37cb](https://github.com/home-lang/pantry/commit/51b37cb)) _(by Chris <chrisbreuer93@gmail.com>)_
- port high-impact brewkit improvements to buildkit ([29b808a](https://github.com/home-lang/pantry/commit/29b808a)) _(by Chris <chrisbreuer93@gmail.com>)_
- add targeted build-package workflow for quick iteration ([fff7504](https://github.com/home-lang/pantry/commit/fff7504)) _(by Chris <chrisbreuer93@gmail.com>)_
- topological sort packages by dependency depth ([e7ccca4](https://github.com/home-lang/pantry/commit/e7ccca4)) _(by Chris <chrisbreuer93@gmail.com>)_
- add buildkit to build all 1159 pantry packages from source ([d11cb59](https://github.com/home-lang/pantry/commit/d11cb59)) _(by Chris <chrisbreuer93@gmail.com>)_
- add 'pantry oidc setup' command for trusted publisher configuration ([b74073f](https://github.com/home-lang/pantry/commit/b74073f)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🐛 Bug Fixes

- add 117 more packages to known-broken list from run 22169381361 ([bf6f725](https://github.com/home-lang/pantry/commit/bf6f725)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve lint errors in build scripts ([bfca3a6](https://github.com/home-lang/pantry/commit/bfca3a6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add 12 more packages to known-broken list from batches 15-19 ([4764087](https://github.com/home-lang/pantry/commit/4764087)) _(by Chris <chrisbreuer93@gmail.com>)_
- add more packages to known-broken list from batches 13-18 ([78ee16a](https://github.com/home-lang/pantry/commit/78ee16a)) _(by Chris <chrisbreuer93@gmail.com>)_
- add 31 more packages to known-broken list from run 22165206563 ([e441096](https://github.com/home-lang/pantry/commit/e441096)) _(by Chris <chrisbreuer93@gmail.com>)_
- add more packages to known-broken list ([b46c0cd](https://github.com/home-lang/pantry/commit/b46c0cd)) _(by Chris <chrisbreuer93@gmail.com>)_
- add glibtool symlink and ensure /opt/homebrew/bin in PATH on macOS ([be06f76](https://github.com/home-lang/pantry/commit/be06f76)) _(by Chris <chrisbreuer93@gmail.com>)_
- use DYLD_FALLBACK_LIBRARY_PATH on macOS, add missing Linux dev deps ([1829c60](https://github.com/home-lang/pantry/commit/1829c60)) _(by Chris <chrisbreuer93@gmail.com>)_
- prevent sync-binaries runs from being cancelled by new triggers ([ed7364f](https://github.com/home-lang/pantry/commit/ed7364f)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove Debian-patched setuptools/wheel instead of just upgrading ([ae9db43](https://github.com/home-lang/pantry/commit/ae9db43)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve Python setuptools install_layout and missing Go on macOS ([a068637](https://github.com/home-lang/pantry/commit/a068637)) _(by Chris <chrisbreuer93@gmail.com>)_
- isolate cargo/rustup per-build and add gfortran support ([2eb35e8](https://github.com/home-lang/pantry/commit/2eb35e8)) _(by Chris <chrisbreuer93@gmail.com>)_
- prevent find ([5a22773](https://github.com/home-lang/pantry/commit/5a22773)) _(by head SIGPIPE crash in cargo fallback with set -eo pipefail <Chris>)_
- BSD sed compatibility, findYamls traversal bug, and string build detection ([7dd7dde](https://github.com/home-lang/pantry/commit/7dd7dde)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve cargo PATH detection, macOS deployment target, and obsolete linker flags ([5cd9fad](https://github.com/home-lang/pantry/commit/5cd9fad)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle trailing .0 in version matching and multiline transform regex ([87e6dfd](https://github.com/home-lang/pantry/commit/87e6dfd)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle more build edge cases (permissions, .war files, cargo-c, libxslt) ([8ba5dda](https://github.com/home-lang/pantry/commit/8ba5dda)) _(by Chris <chrisbreuer93@gmail.com>)_
- clear bash hash table before build script to fix cargo not found ([61edcec](https://github.com/home-lang/pantry/commit/61edcec)) _(by Chris <chrisbreuer93@gmail.com>)_
- windows cross-compilation errors in io_helper, extractor, installer, package ([5d8f500](https://github.com/home-lang/pantry/commit/5d8f500)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add 8 more packages to known broken list ([49fa72d](https://github.com/home-lang/pantry/commit/49fa72d)) _(by Chris <chrisbreuer93@gmail.com>)_
- lint errors ([fd65216](https://github.com/home-lang/pantry/commit/fd65216)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- lint errors ([fe47b06](https://github.com/home-lang/pantry/commit/fe47b06)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add docker.com/cli, reshape, frei0r to known broken list ([9a51dd2](https://github.com/home-lang/pantry/commit/9a51dd2)) _(by Chris <chrisbreuer93@gmail.com>)_
- don't override recipe GOPATH in Go toolchain setup ([a436340](https://github.com/home-lang/pantry/commit/a436340)) _(by Chris <chrisbreuer93@gmail.com>)_
- add python-venv.py script shim for pkgx YAML recipes ([ab71b50](https://github.com/home-lang/pantry/commit/ab71b50)) _(by Chris <chrisbreuer93@gmail.com>)_
- reduce per-package timeout to 30 min and add batch time budget ([9d257d6](https://github.com/home-lang/pantry/commit/9d257d6)) _(by Chris <chrisbreuer93@gmail.com>)_
- strip YAML quotes from array items in parser ([74bbf54](https://github.com/home-lang/pantry/commit/74bbf54)) _(by Chris <chrisbreuer93@gmail.com>)_
- create cargo symlinks before Rust toolchain search ([90042e8](https://github.com/home-lang/pantry/commit/90042e8)) _(by Chris <chrisbreuer93@gmail.com>)_
- source rustup env for reliable cargo discovery + add diagnostics ([722092f](https://github.com/home-lang/pantry/commit/722092f)) _(by Chris <chrisbreuer93@gmail.com>)_
- add pwmt.org/girara and zathura to knownBrokenDomains ([a9d0af7](https://github.com/home-lang/pantry/commit/a9d0af7)) _(by Chris <chrisbreuer93@gmail.com>)_
- move x.org/x11 local-transport override from YAML to buildkit code ([a5afa52](https://github.com/home-lang/pantry/commit/a5afa52)) _(by Chris <chrisbreuer93@gmail.com>)_
- only activate GCC specs workaround on Linux, not macOS ([a36f6d8](https://github.com/home-lang/pantry/commit/a36f6d8)) _(by Chris <chrisbreuer93@gmail.com>)_
- disable local-transport for x.org/x11 on Linux (sys/stropts.h removed in glibc 2.38+) ([06e31c4](https://github.com/home-lang/pantry/commit/06e31c4)) _(by Chris <chrisbreuer93@gmail.com>)_
- correct YAML multiline scalar continuation indent from +4 to +2 ([4b01ce1](https://github.com/home-lang/pantry/commit/4b01ce1)) _(by Chris <chrisbreuer93@gmail.com>)_
- show tail of generated build script on failure to see user commands ([0dae0c7](https://github.com/home-lang/pantry/commit/0dae0c7)) _(by Chris <chrisbreuer93@gmail.com>)_
- don't add default -o for preprocessor invocations in specs workaround ([073fb43](https://github.com/home-lang/pantry/commit/073fb43)) _(by Chris <chrisbreuer93@gmail.com>)_
- also wrap cpp in cc_wrapper to handle ./specs directory ([75a4c0e](https://github.com/home-lang/pantry/commit/75a4c0e)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle default output paths in GCC specs workaround ([89a91e7](https://github.com/home-lang/pantry/commit/89a91e7)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve diagnostics for GCC specs workaround debugging ([c7795e0](https://github.com/home-lang/pantry/commit/c7795e0)) _(by Chris <chrisbreuer93@gmail.com>)_
- work around GCC ./specs directory issue via cc_wrapper CWD change ([4bc10e3](https://github.com/home-lang/pantry/commit/4bc10e3)) _(by Chris <chrisbreuer93@gmail.com>)_
- use GCC_EXEC_PREFIX to prevent ./specs directory confusion on Linux ([e273abf](https://github.com/home-lang/pantry/commit/e273abf)) _(by Chris <chrisbreuer93@gmail.com>)_
- work around GCC ./specs directory issue on Linux ([d5d3fb5](https://github.com/home-lang/pantry/commit/d5d3fb5)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve compiler diagnostic to test with CFLAGS+LDFLAGS ([6ef920f](https://github.com/home-lang/pantry/commit/6ef920f)) _(by Chris <chrisbreuer93@gmail.com>)_
- add compiler diagnostics + config.log dump for build failures ([59b2079](https://github.com/home-lang/pantry/commit/59b2079)) _(by Chris <chrisbreuer93@gmail.com>)_
- increase per-package timeout to 60 min (codex needs ~50 min) ([093f1e7](https://github.com/home-lang/pantry/commit/093f1e7)) _(by Chris <chrisbreuer93@gmail.com>)_
- add libcap-dev for codex, add broken Rust packages to skip list ([fdbb487](https://github.com/home-lang/pantry/commit/fdbb487)) _(by Chris <chrisbreuer93@gmail.com>)_
- increase per-package build timeout to 45 min for large Rust builds ([91a9136](https://github.com/home-lang/pantry/commit/91a9136)) _(by Chris <chrisbreuer93@gmail.com>)_
- add broken packages to skip lists based on run analysis ([e11c955](https://github.com/home-lang/pantry/commit/e11c955)) _(by Chris <chrisbreuer93@gmail.com>)_
- persist cargo PATH via GITHUB_PATH, add broken packages to skip list ([45104bd](https://github.com/home-lang/pantry/commit/45104bd)) _(by Chris <chrisbreuer93@gmail.com>)_
- use GCC-compatible CFLAGS on Linux (-Wno-error=incompatible-pointer-types) ([247f5ae](https://github.com/home-lang/pantry/commit/247f5ae)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove Linux LDFLAGS that breaks configure compiler tests ([01c9eb8](https://github.com/home-lang/pantry/commit/01c9eb8)) _(by Chris <chrisbreuer93@gmail.com>)_
- upgrade to macOS 15 runners, add Swift 6.2 support, fix pip/Rust/multiarch issues ([7f290b0](https://github.com/home-lang/pantry/commit/7f290b0)) _(by Chris <chrisbreuer93@gmail.com>)_
- add Linux LDFLAGS and relax warnings-as-errors ([040f365](https://github.com/home-lang/pantry/commit/040f365)) _(by Chris <chrisbreuer93@gmail.com>)_
- comprehensive CI system packages, GNU mirror, and broken domain fixes ([b81a75c](https://github.com/home-lang/pantry/commit/b81a75c)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve cargo discovery and CMake compatibility in buildkit ([2a85661](https://github.com/home-lang/pantry/commit/2a85661)) _(by Chris <chrisbreuer93@gmail.com>)_
- add --without-icu to postgresql/libpq recipe ([bad1bba](https://github.com/home-lang/pantry/commit/bad1bba)) _(by Chris <chrisbreuer93@gmail.com>)_
- hardcoded version URLs, broken recipes, update Rust toolchain ([59dd742](https://github.com/home-lang/pantry/commit/59dd742)) _(by Chris <chrisbreuer93@gmail.com>)_
- prevent update-pantry from overwriting local recipe fixes ([69d377c](https://github.com/home-lang/pantry/commit/69d377c)) _(by Chris <chrisbreuer93@gmail.com>)_
- use {{version}} in distributable URLs instead of hardcoded versions ([637bceb](https://github.com/home-lang/pantry/commit/637bceb)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML parser array-at-same-indent bug, install -D shim, darwin CFLAGS ([f407f44](https://github.com/home-lang/pantry/commit/f407f44)) _(by Chris <chrisbreuer93@gmail.com>)_
- compiler wrapper heredoc parsing error (Unexpected @) ([07ef845](https://github.com/home-lang/pantry/commit/07ef845)) _(by Chris <chrisbreuer93@gmail.com>)_
- reduce knownBrokenDomains, fix berkeley-db recipe ([f47b966](https://github.com/home-lang/pantry/commit/f47b966)) _(by Chris <chrisbreuer93@gmail.com>)_
- PYTHONPATH for system Python modules, add missing macOS deps, fix pkgm strip-components ([d12177f](https://github.com/home-lang/pantry/commit/d12177f)) _(by Chris <chrisbreuer93@gmail.com>)_
- pass packages as comma-separated to -p (parseArgs only keeps last) ([e15e6fd](https://github.com/home-lang/pantry/commit/e15e6fd)) _(by Chris <chrisbreuer93@gmail.com>)_
- bypass all filters for targeted builds + add python3-libxml2 to CI ([7799162](https://github.com/home-lang/pantry/commit/7799162)) _(by Chris <chrisbreuer93@gmail.com>)_
- -p flag now bypasses knownBroken/toolchain filters for targeted builds ([e0aa369](https://github.com/home-lang/pantry/commit/e0aa369)) _(by Chris <chrisbreuer93@gmail.com>)_
- add missing system deps to CI, remove fixable packages from knownBroken ([ffe09cf](https://github.com/home-lang/pantry/commit/ffe09cf)) _(by Chris <chrisbreuer93@gmail.com>)_
- ln wrapper, cargo detection, recipe fixes, knownBroken updates ([d8f6cf1](https://github.com/home-lang/pantry/commit/d8f6cf1)) _(by Chris <chrisbreuer93@gmail.com>)_
- symlink cargo/rustup into overridden HOME + URL safety ([9b5eb4a](https://github.com/home-lang/pantry/commit/9b5eb4a)) _(by Chris <chrisbreuer93@gmail.com>)_
- move SRCROOT setup before recipe env for proper overrides ([f1c1d7d](https://github.com/home-lang/pantry/commit/f1c1d7d)) _(by Chris <chrisbreuer93@gmail.com>)_
- more recipe fixes for zip strip-components conflicts ([6a44024](https://github.com/home-lang/pantry/commit/6a44024)) _(by Chris <chrisbreuer93@gmail.com>)_
- recipe fixes and non-archive download handling ([48dec17](https://github.com/home-lang/pantry/commit/48dec17)) _(by Chris <chrisbreuer93@gmail.com>)_
- always cd to buildDir before working-directory subdirectory ([86c249a](https://github.com/home-lang/pantry/commit/86c249a)) _(by Chris <chrisbreuer93@gmail.com>)_
- auto-detect system dep prefix for toolchain packages ([8b84407](https://github.com/home-lang/pantry/commit/8b84407)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove exported bash functions that pollute child process environments ([20f4ea8](https://github.com/home-lang/pantry/commit/20f4ea8)) _(by Chris <chrisbreuer93@gmail.com>)_
- add missing system build deps to CI workflow ([50c3bb1](https://github.com/home-lang/pantry/commit/50c3bb1)) _(by Chris <chrisbreuer93@gmail.com>)_
- prop heredoc escaping, JAVA_HOME detection, download retries ([1b64a4b](https://github.com/home-lang/pantry/commit/1b64a4b)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve multiple build failures for pantry package compilation ([920a382](https://github.com/home-lang/pantry/commit/920a382)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML parser URL detection regression - use looksLikeKeyValue ([2be356e](https://github.com/home-lang/pantry/commit/2be356e)) _(by Chris <chrisbreuer93@gmail.com>)_
- strip YAML inline comments from parser values ([8f0a67f](https://github.com/home-lang/pantry/commit/8f0a67f)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML dep extraction, platform filtering, meson venv, install -D shim, URL parsing ([723d92b](https://github.com/home-lang/pantry/commit/723d92b)) _(by Chris <chrisbreuer93@gmail.com>)_
- strip trailing .0 from versions on download failure ([9168e87](https://github.com/home-lang/pantry/commit/9168e87)) _(by Chris <chrisbreuer93@gmail.com>)_
- fix pkg-config in downloaded deps, add system pkg-config paths ([946b4b6](https://github.com/home-lang/pantry/commit/946b4b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- version fallback, meson venv, dep path pollution, fix-shebangs shim, direct build arrays ([9651099](https://github.com/home-lang/pantry/commit/9651099)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle multi-line plain scalar continuation in YAML arrays ([520c4db](https://github.com/home-lang/pantry/commit/520c4db)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML parser overhaul for run arrays, working-directory, inline mappings ([82675e3](https://github.com/home-lang/pantry/commit/82675e3)) _(by Chris <chrisbreuer93@gmail.com>)_
- URL-encode source URLs and validate download size ([5bb5519](https://github.com/home-lang/pantry/commit/5bb5519)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve Go GOROOT mismatch, -pie LDFLAGS, and version 404s ([e9cc094](https://github.com/home-lang/pantry/commit/e9cc094)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML parser for if:/working-directory, skip broken recipes, exit 0 ([42eddc9](https://github.com/home-lang/pantry/commit/42eddc9)) _(by Chris <chrisbreuer93@gmail.com>)_
- preserve system toolchains, add shims, smart filtering ([fcfcbf0](https://github.com/home-lang/pantry/commit/fcfcbf0)) _(by Chris <chrisbreuer93@gmail.com>)_
- complex strip patterns, GNU sed on macOS, regex for nested / ([ba6a319](https://github.com/home-lang/pantry/commit/ba6a319)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle git+https sources, smart version.tag, exit non-zero on failures ([e60712a](https://github.com/home-lang/pantry/commit/e60712a)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve template interpolation, YAML parsing, S3 binary download issues ([e3f6c53](https://github.com/home-lang/pantry/commit/e3f6c53)) _(by Chris <chrisbreuer93@gmail.com>)_
- prevent batch crash on cleanup errors, fix compiler flag ordering ([73f16d7](https://github.com/home-lang/pantry/commit/73f16d7)) _(by Chris <chrisbreuer93@gmail.com>)_
- dynamic python version, linux build deps for postgres ([dce1638](https://github.com/home-lang/pantry/commit/dce1638)) _(by Chris <chrisbreuer93@gmail.com>)_
- add Linux support for postgres/mysql, update python URL ([8e48f3d](https://github.com/home-lang/pantry/commit/8e48f3d)) _(by Chris <chrisbreuer93@gmail.com>)_
- use direct symlink instead of bun link for ts-cloud in CI ([5ca7dfe](https://github.com/home-lang/pantry/commit/5ca7dfe)) _(by Chris <chrisbreuer93@gmail.com>)_
- use ts-cloud via bun link for S3 operations ([41c3aa8](https://github.com/home-lang/pantry/commit/41c3aa8)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve module resolution and GitHub API rate limits in CI ([43de03f](https://github.com/home-lang/pantry/commit/43de03f)) _(by Chris <chrisbreuer93@gmail.com>)_
- reap child process after kill on script timeout in enhanced.zig ([ac49ee7](https://github.com/home-lang/pantry/commit/ac49ee7)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve error handling, temp dir resolution, and child process cleanup ([358f66c](https://github.com/home-lang/pantry/commit/358f66c)) _(by Chris <chrisbreuer93@gmail.com>)_
- security hardening, bug fixes, and performance improvements ([152c7cc](https://github.com/home-lang/pantry/commit/152c7cc)) _(by Chris <chrisbreuer93@gmail.com>)_
- update Zig to 0.16.0-dev.2471 and fix Cwd API compatibility ([52b4833](https://github.com/home-lang/pantry/commit/52b4833)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- replace std.fs.openFileAbsolute with io_helper wrapper ([00b0f45](https://github.com/home-lang/pantry/commit/00b0f45)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- send empty body for POST request in token exchange ([b2ac802](https://github.com/home-lang/pantry/commit/b2ac802)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- correct npm OIDC audience to npm:registry.npmjs.org ([27cd79f](https://github.com/home-lang/pantry/commit/27cd79f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- remaining child.kill() calls for Zig 0.16 compatibility ([b8fb39a](https://github.com/home-lang/pantry/commit/b8fb39a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Child.run and child.kill wrappers for Zig 0.16 compatibility ([bed6a6b](https://github.com/home-lang/pantry/commit/bed6a6b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- more Child.run and makePath calls for Zig 0.16 compatibility ([c62fc00](https://github.com/home-lang/pantry/commit/c62fc00)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use io_helper wrappers for Child.run and makePath across codebase ([1bd3aa2](https://github.com/home-lang/pantry/commit/1bd3aa2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add npm-auth-type: oidc header for OIDC publishing ([2b99ed2](https://github.com/home-lang/pantry/commit/2b99ed2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update std.c to std.posix.system for Zig 0.16 ([557f81f](https://github.com/home-lang/pantry/commit/557f81f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- exclude zig compiler and tarballs from package ([805be1e](https://github.com/home-lang/pantry/commit/805be1e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add tarball size check and peek at large tarballs ([e43f8c8](https://github.com/home-lang/pantry/commit/e43f8c8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use rsync for tarball creation with debug output ([251603d](https://github.com/home-lang/pantry/commit/251603d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use tar --transform to create npm-compatible tarballs ([bb34422](https://github.com/home-lang/pantry/commit/bb34422)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- patch zig-config for Zig 0.16 in CI ([d524ba7](https://github.com/home-lang/pantry/commit/d524ba7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- format zig files and fix OIDC test error handling ([0a3acf3](https://github.com/home-lang/pantry/commit/0a3acf3)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- correct GitHub release asset URLs in action ([7f50317](https://github.com/home-lang/pantry/commit/7f50317)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- check NODE_AUTH_TOKEN as fallback for npm token auth ([ec3d225](https://github.com/home-lang/pantry/commit/ec3d225)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- don't URL-encode @ in scoped package names for npm registry ([d7fba9f](https://github.com/home-lang/pantry/commit/d7fba9f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- sanitize scoped package names in provenance and fix integer overflow ([84518a2](https://github.com/home-lang/pantry/commit/84518a2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- create tarball in temp directory to avoid file-changed error ([5d5bf9e](https://github.com/home-lang/pantry/commit/5d5bf9e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- sanitize scoped package names for tarball filenames ([d1e4a1f](https://github.com/home-lang/pantry/commit/d1e4a1f)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### ⚡ Performance Improvements

- cache brew packages and increase parallelism for faster CI ([ff9d41f](https://github.com/home-lang/pantry/commit/ff9d41f)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🧹 Chores

- release vv0.8.1 ([6ba8bdb](https://github.com/home-lang/pantry/commit/6ba8bdb)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7945247](https://github.com/home-lang/pantry/commit/7945247)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update freetds, LLaMA.cpp ([c4a76f0](https://github.com/home-lang/pantry/commit/c4a76f0)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update virtualenv ([be10292](https://github.com/home-lang/pantry/commit/be10292)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update apko ([bd992ff](https://github.com/home-lang/pantry/commit/bd992ff)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update consul, LLaMA.cpp, tox ([b12c174](https://github.com/home-lang/pantry/commit/b12c174)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cargo-tarpaulin, depot, z3, vals ([4e30f88](https://github.com/home-lang/pantry/commit/4e30f88)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, vals, pulumi ([e14f64d](https://github.com/home-lang/pantry/commit/e14f64d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update filelock, vcluster ([cb20fc5](https://github.com/home-lang/pantry/commit/cb20fc5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update ia ([dbda8c1](https://github.com/home-lang/pantry/commit/dbda8c1)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update azcopy ([0261b94](https://github.com/home-lang/pantry/commit/0261b94)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli, spec-kit, moon, vim ([70dce0b](https://github.com/home-lang/pantry/commit/70dce0b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws-sdk-cpp, LLaMA.cpp, glab, vim ([1978471](https://github.com/home-lang/pantry/commit/1978471)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update crush, LLaMA.cpp, terragrunt ([cb03b00](https://github.com/home-lang/pantry/commit/cb03b00)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli, tox ([bd2a1e5](https://github.com/home-lang/pantry/commit/bd2a1e5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update fly, gcloud ([9ad196b](https://github.com/home-lang/pantry/commit/9ad196b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, psycopg3, vim ([984b7e9](https://github.com/home-lang/pantry/commit/984b7e9)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update syft, gh, flipt, hugo, jenkins-lts and 1 other dep ([45805c7](https://github.com/home-lang/pantry/commit/45805c7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- set max-parallel to 8 ([f4def27](https://github.com/home-lang/pantry/commit/f4def27)) _(by Chris <chrisbreuer93@gmail.com>)_
- update bind9, soliditylang, vim ([2fecdc7](https://github.com/home-lang/pantry/commit/2fecdc7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- regenerate package catalog ([689e032](https://github.com/home-lang/pantry/commit/689e032)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update squidfunk/mkdocs-material ([677b7a3](https://github.com/home-lang/pantry/commit/677b7a3)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([f6e16b2](https://github.com/home-lang/pantry/commit/f6e16b2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([12bf88f](https://github.com/home-lang/pantry/commit/12bf88f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- release v0.8.1 ([e095dda](https://github.com/home-lang/pantry/commit/e095dda)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update loki, tailwindcss ([c928bd2](https://github.com/home-lang/pantry/commit/c928bd2)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([93d568b](https://github.com/home-lang/pantry/commit/93d568b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update argo-cd, periphery ([4140bec](https://github.com/home-lang/pantry/commit/4140bec)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update argo-cd, checkov, rtx-cli, sk and 3 other deps ([61de58a](https://github.com/home-lang/pantry/commit/61de58a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([9e0f4e7](https://github.com/home-lang/pantry/commit/9e0f4e7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update casdoor, LLaMA.cpp ([5a6c0a2](https://github.com/home-lang/pantry/commit/5a6c0a2)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update libgpg-error ([4a9f15b](https://github.com/home-lang/pantry/commit/4a9f15b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([887d98b](https://github.com/home-lang/pantry/commit/887d98b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update checkov ([87a55c1](https://github.com/home-lang/pantry/commit/87a55c1)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, opa ([adb8f11](https://github.com/home-lang/pantry/commit/adb8f11)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, codex ([406e812](https://github.com/home-lang/pantry/commit/406e812)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update taglib-config ([a328803](https://github.com/home-lang/pantry/commit/a328803)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update mas, laravel, pulumi ([bbfdfba](https://github.com/home-lang/pantry/commit/bbfdfba)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([3630b5b](https://github.com/home-lang/pantry/commit/3630b5b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update codex ([22d8a8f](https://github.com/home-lang/pantry/commit/22d8a8f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update Arkade ([88b54f4](https://github.com/home-lang/pantry/commit/88b54f4)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update uv, LLaMA.cpp ([16a9a71](https://github.com/home-lang/pantry/commit/16a9a71)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws-sdk-cpp ([fbbc5e1](https://github.com/home-lang/pantry/commit/fbbc5e1)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli, aws-iam-authenticator, tox ([084c85f](https://github.com/home-lang/pantry/commit/084c85f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update pik, odigos, codex ([89acad3](https://github.com/home-lang/pantry/commit/89acad3)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update fly, glab ([c627a24](https://github.com/home-lang/pantry/commit/c627a24)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update kargo, spider, stripe, tox, vim ([bc9e0d8](https://github.com/home-lang/pantry/commit/bc9e0d8)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update rclone ([148208c](https://github.com/home-lang/pantry/commit/148208c)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update werf ([8fafbcb](https://github.com/home-lang/pantry/commit/8fafbcb)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cnquery, deno, mvfst, golangci-lint and 1 other dep ([e17e707](https://github.com/home-lang/pantry/commit/e17e707)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([40b5332](https://github.com/home-lang/pantry/commit/40b5332)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([dd12f2b](https://github.com/home-lang/pantry/commit/dd12f2b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update uv, rtx-cli, mise, openstack, pnp and 2 other deps ([e3be051](https://github.com/home-lang/pantry/commit/e3be051)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([b89aade](https://github.com/home-lang/pantry/commit/b89aade)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update llrt, golangci-lint, rucio-client ([362b519](https://github.com/home-lang/pantry/commit/362b519)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([9a2f598](https://github.com/home-lang/pantry/commit/9a2f598)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update casdoor, elementsproject, LLaMA.cpp and 2 other deps ([94866f5](https://github.com/home-lang/pantry/commit/94866f5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update babashka, rtx-cli, apko ([4f810ce](https://github.com/home-lang/pantry/commit/4f810ce)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([7288eca](https://github.com/home-lang/pantry/commit/7288eca)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update cnquery, LLaMA.cpp, mise ([16b8e50](https://github.com/home-lang/pantry/commit/16b8e50)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cilium ([a5cc21c](https://github.com/home-lang/pantry/commit/a5cc21c)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update freetds ([3697308](https://github.com/home-lang/pantry/commit/3697308)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update pocketbase ([eecd4d5](https://github.com/home-lang/pantry/commit/eecd4d5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update ghq ([fb43462](https://github.com/home-lang/pantry/commit/fb43462)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([d284c2a](https://github.com/home-lang/pantry/commit/d284c2a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- add Go 1.26 incompatible packages to knownBrokenDomains ([479e6ae](https://github.com/home-lang/pantry/commit/479e6ae)) _(by Chris <chrisbreuer93@gmail.com>)_
- update LLaMA.cpp ([4e005d9](https://github.com/home-lang/pantry/commit/4e005d9)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- add jetporch.com to knownBrokenDomains ([c3241fe](https://github.com/home-lang/pantry/commit/c3241fe)) _(by Chris <chrisbreuer93@gmail.com>)_
- add more entries to knownBrokenDomains ([3251b64](https://github.com/home-lang/pantry/commit/3251b64)) _(by Chris <chrisbreuer93@gmail.com>)_
- update LLaMA.cpp ([f89108d](https://github.com/home-lang/pantry/commit/f89108d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws-sdk-cpp, LLaMA.cpp, rabbitmq and 3 other deps ([e6e7604](https://github.com/home-lang/pantry/commit/e6e7604)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (12 files) ([89bd31b](https://github.com/home-lang/pantry/commit/89bd31b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update biome, fish, cirrus, ollama ([e934b6a](https://github.com/home-lang/pantry/commit/e934b6a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (2 files) ([0586cdd](https://github.com/home-lang/pantry/commit/0586cdd)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update vim ([edd155e](https://github.com/home-lang/pantry/commit/edd155e)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws-sdk-cpp, kafka.apache, linux-headers, vim ([0f09d5c](https://github.com/home-lang/pantry/commit/0f09d5c)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli, linux-headers, oh-my-posh ([2384b7b](https://github.com/home-lang/pantry/commit/2384b7b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (7 files) ([20e3a71](https://github.com/home-lang/pantry/commit/20e3a71)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli ([62f2681](https://github.com/home-lang/pantry/commit/62f2681)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update opencode.ai ([7ed9e3f](https://github.com/home-lang/pantry/commit/7ed9e3f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update fly, LLaMA.cpp ([12d2e17](https://github.com/home-lang/pantry/commit/12d2e17)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update istioctl ([c352540](https://github.com/home-lang/pantry/commit/c352540)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update surreal ([8890ac5](https://github.com/home-lang/pantry/commit/8890ac5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update biome, edencommon, fb303, thrift1 and 4 other deps ([e2738fb](https://github.com/home-lang/pantry/commit/e2738fb)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, typos, linux-headers, oh-my-posh ([6b0b146](https://github.com/home-lang/pantry/commit/6b0b146)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update argo-workflows ([4fecfe2](https://github.com/home-lang/pantry/commit/4fecfe2)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([5982ba6](https://github.com/home-lang/pantry/commit/5982ba6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update maturin, rucio-client ([4121012](https://github.com/home-lang/pantry/commit/4121012)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update arrow, LLaMA.cpp, kubebuilder ([486de65](https://github.com/home-lang/pantry/commit/486de65)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([19f5695](https://github.com/home-lang/pantry/commit/19f5695)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4da3bd3](https://github.com/home-lang/pantry/commit/4da3bd3)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6497935](https://github.com/home-lang/pantry/commit/6497935)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b7bd8fb](https://github.com/home-lang/pantry/commit/b7bd8fb)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d1aa838](https://github.com/home-lang/pantry/commit/d1aa838)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update k6 ([5bde90f](https://github.com/home-lang/pantry/commit/5bde90f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([ebb58b7](https://github.com/home-lang/pantry/commit/ebb58b7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update odigos, openapi-generator ([c0ab59a](https://github.com/home-lang/pantry/commit/c0ab59a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([269e372](https://github.com/home-lang/pantry/commit/269e372)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([84013ec](https://github.com/home-lang/pantry/commit/84013ec)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update casdoor, checkov, iproute2mac, LLaMA.cpp ([21d2fa3](https://github.com/home-lang/pantry/commit/21d2fa3)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update maturin ([8a7a8d4](https://github.com/home-lang/pantry/commit/8a7a8d4)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update soldeer ([54766ab](https://github.com/home-lang/pantry/commit/54766ab)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update platformdirs ([b0b5792](https://github.com/home-lang/pantry/commit/b0b5792)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cirrus, filelock, libsoup ([10474d5](https://github.com/home-lang/pantry/commit/10474d5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([fa2e226](https://github.com/home-lang/pantry/commit/fa2e226)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update apko ([22ad35d](https://github.com/home-lang/pantry/commit/22ad35d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([9996ab2](https://github.com/home-lang/pantry/commit/9996ab2)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update qsv ([4b82c9a](https://github.com/home-lang/pantry/commit/4b82c9a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([b8408a8](https://github.com/home-lang/pantry/commit/b8408a8)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([8be542a](https://github.com/home-lang/pantry/commit/8be542a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update filelock ([6474a41](https://github.com/home-lang/pantry/commit/6474a41)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([07f08ae](https://github.com/home-lang/pantry/commit/07f08ae)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update tox ([a96249e](https://github.com/home-lang/pantry/commit/a96249e)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update opencode.ai ([8df4081](https://github.com/home-lang/pantry/commit/8df4081)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, LLaMA.cpp ([7c98299](https://github.com/home-lang/pantry/commit/7c98299)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([763a7d7](https://github.com/home-lang/pantry/commit/763a7d7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update vim ([42dc8f7](https://github.com/home-lang/pantry/commit/42dc8f7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update biome, LLaMA.cpp, vim ([f5a9f24](https://github.com/home-lang/pantry/commit/f5a9f24)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, vim ([7be0d16](https://github.com/home-lang/pantry/commit/7be0d16)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cirrus ([a1c887a](https://github.com/home-lang/pantry/commit/a1c887a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, vim ([218ef88](https://github.com/home-lang/pantry/commit/218ef88)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, sing-box, vim ([e5b39b8](https://github.com/home-lang/pantry/commit/e5b39b8)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, iproute2mac ([6f9cfa1](https://github.com/home-lang/pantry/commit/6f9cfa1)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update glab ([fa1411d](https://github.com/home-lang/pantry/commit/fa1411d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update ducker ([0e3828b](https://github.com/home-lang/pantry/commit/0e3828b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([11ca868](https://github.com/home-lang/pantry/commit/11ca868)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update rtx-cli, mise ([9cb20f7](https://github.com/home-lang/pantry/commit/9cb20f7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([aa660d0](https://github.com/home-lang/pantry/commit/aa660d0)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([72d249a](https://github.com/home-lang/pantry/commit/72d249a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([1955d05](https://github.com/home-lang/pantry/commit/1955d05)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([4263261](https://github.com/home-lang/pantry/commit/4263261)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([ee58a1a](https://github.com/home-lang/pantry/commit/ee58a1a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([fbff7f7](https://github.com/home-lang/pantry/commit/fbff7f7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update opencode.ai ([5b81418](https://github.com/home-lang/pantry/commit/5b81418)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cover image ([a0c03fb](https://github.com/home-lang/pantry/commit/a0c03fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- update opencode.ai, sbt ([50076bb](https://github.com/home-lang/pantry/commit/50076bb)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update periphery ([b394c43](https://github.com/home-lang/pantry/commit/b394c43)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([d5bf4fa](https://github.com/home-lang/pantry/commit/d5bf4fa)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, libsoup ([ab7c27f](https://github.com/home-lang/pantry/commit/ab7c27f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([a8b1b6a](https://github.com/home-lang/pantry/commit/a8b1b6a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, platformdirs ([5b2f07f](https://github.com/home-lang/pantry/commit/5b2f07f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([5ff4902](https://github.com/home-lang/pantry/commit/5ff4902)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([c148a5b](https://github.com/home-lang/pantry/commit/c148a5b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([6824026](https://github.com/home-lang/pantry/commit/6824026)) _(by Chris <chrisbreuer93@gmail.com>)_
- update abseil, acorn, Auto-GPT, git-crypt and 16 other deps ([ab7d41d](https://github.com/home-lang/pantry/commit/ab7d41d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- minor cleanup ([13d313a](https://github.com/home-lang/pantry/commit/13d313a)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve `update-packages` and `update-pantry` ([584dbd0](https://github.com/home-lang/pantry/commit/584dbd0)) _(by Chris <chrisbreuer93@gmail.com>)_
- move docs ([871a1ec](https://github.com/home-lang/pantry/commit/871a1ec)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve safeguard logic ([8719cc3](https://github.com/home-lang/pantry/commit/8719cc3)) _(by Chris <chrisbreuer93@gmail.com>)_
- minor updates ([db024c1](https://github.com/home-lang/pantry/commit/db024c1)) _(by Chris <chrisbreuer93@gmail.com>)_
- update registry data (8 files) ([04a45e0](https://github.com/home-lang/pantry/commit/04a45e0)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([af5ed61](https://github.com/home-lang/pantry/commit/af5ed61)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([901c867](https://github.com/home-lang/pantry/commit/901c867)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7ad4dd3](https://github.com/home-lang/pantry/commit/7ad4dd3)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([126713e](https://github.com/home-lang/pantry/commit/126713e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5434110](https://github.com/home-lang/pantry/commit/5434110)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5ef3b24](https://github.com/home-lang/pantry/commit/5ef3b24)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([45e1179](https://github.com/home-lang/pantry/commit/45e1179)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([18afa1d](https://github.com/home-lang/pantry/commit/18afa1d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c7d55b4](https://github.com/home-lang/pantry/commit/c7d55b4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b194ef8](https://github.com/home-lang/pantry/commit/b194ef8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([eba6b03](https://github.com/home-lang/pantry/commit/eba6b03)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bffce59](https://github.com/home-lang/pantry/commit/bffce59)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([fda8d87](https://github.com/home-lang/pantry/commit/fda8d87)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7400a5f](https://github.com/home-lang/pantry/commit/7400a5f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([42cd0cc](https://github.com/home-lang/pantry/commit/42cd0cc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a99173e](https://github.com/home-lang/pantry/commit/a99173e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ea360b7](https://github.com/home-lang/pantry/commit/ea360b7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6f62310](https://github.com/home-lang/pantry/commit/6f62310)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2eaf0aa](https://github.com/home-lang/pantry/commit/2eaf0aa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f4f0bd6](https://github.com/home-lang/pantry/commit/f4f0bd6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([30aa0b6](https://github.com/home-lang/pantry/commit/30aa0b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9edeb68](https://github.com/home-lang/pantry/commit/9edeb68)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7924f19](https://github.com/home-lang/pantry/commit/7924f19)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([966aeee](https://github.com/home-lang/pantry/commit/966aeee)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dfb6076](https://github.com/home-lang/pantry/commit/dfb6076)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6f792d1](https://github.com/home-lang/pantry/commit/6f792d1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2f8325d](https://github.com/home-lang/pantry/commit/2f8325d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([23036c6](https://github.com/home-lang/pantry/commit/23036c6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([79a1b36](https://github.com/home-lang/pantry/commit/79a1b36)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7e7164a](https://github.com/home-lang/pantry/commit/7e7164a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1fdef6c](https://github.com/home-lang/pantry/commit/1fdef6c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([682f073](https://github.com/home-lang/pantry/commit/682f073)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5c82c0e](https://github.com/home-lang/pantry/commit/5c82c0e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([8c462a2](https://github.com/home-lang/pantry/commit/8c462a2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5e2adf8](https://github.com/home-lang/pantry/commit/5e2adf8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1e3cab7](https://github.com/home-lang/pantry/commit/1e3cab7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3ad0d30](https://github.com/home-lang/pantry/commit/3ad0d30)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3ec1204](https://github.com/home-lang/pantry/commit/3ec1204)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([154b156](https://github.com/home-lang/pantry/commit/154b156)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([629954c](https://github.com/home-lang/pantry/commit/629954c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([114a984](https://github.com/home-lang/pantry/commit/114a984)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bebca2c](https://github.com/home-lang/pantry/commit/bebca2c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7e88668](https://github.com/home-lang/pantry/commit/7e88668)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([315ad51](https://github.com/home-lang/pantry/commit/315ad51)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e6feb4c](https://github.com/home-lang/pantry/commit/e6feb4c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1e291b2](https://github.com/home-lang/pantry/commit/1e291b2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e641511](https://github.com/home-lang/pantry/commit/e641511)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([83e423e](https://github.com/home-lang/pantry/commit/83e423e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5b50da2](https://github.com/home-lang/pantry/commit/5b50da2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d58374a](https://github.com/home-lang/pantry/commit/d58374a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([134ca0f](https://github.com/home-lang/pantry/commit/134ca0f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5b0fbc6](https://github.com/home-lang/pantry/commit/5b0fbc6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4dc2cf8](https://github.com/home-lang/pantry/commit/4dc2cf8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([0e453c7](https://github.com/home-lang/pantry/commit/0e453c7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d092b23](https://github.com/home-lang/pantry/commit/d092b23)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3132f2e](https://github.com/home-lang/pantry/commit/3132f2e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b2ecc8c](https://github.com/home-lang/pantry/commit/b2ecc8c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ae2eefe](https://github.com/home-lang/pantry/commit/ae2eefe)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ea4ad0a](https://github.com/home-lang/pantry/commit/ea4ad0a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2584594](https://github.com/home-lang/pantry/commit/2584594)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([84caf7e](https://github.com/home-lang/pantry/commit/84caf7e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ca740c9](https://github.com/home-lang/pantry/commit/ca740c9)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1d21553](https://github.com/home-lang/pantry/commit/1d21553)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([88bdafd](https://github.com/home-lang/pantry/commit/88bdafd)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([62b8dcf](https://github.com/home-lang/pantry/commit/62b8dcf)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1672d01](https://github.com/home-lang/pantry/commit/1672d01)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([748f451](https://github.com/home-lang/pantry/commit/748f451)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([997823d](https://github.com/home-lang/pantry/commit/997823d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5cc8fea](https://github.com/home-lang/pantry/commit/5cc8fea)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a141a05](https://github.com/home-lang/pantry/commit/a141a05)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a598a7c](https://github.com/home-lang/pantry/commit/a598a7c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([941af00](https://github.com/home-lang/pantry/commit/941af00)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e24926c](https://github.com/home-lang/pantry/commit/e24926c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([685e772](https://github.com/home-lang/pantry/commit/685e772)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([0087877](https://github.com/home-lang/pantry/commit/0087877)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1ad5334](https://github.com/home-lang/pantry/commit/1ad5334)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([0669092](https://github.com/home-lang/pantry/commit/0669092)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([67e1404](https://github.com/home-lang/pantry/commit/67e1404)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bb097f4](https://github.com/home-lang/pantry/commit/bb097f4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ea993c2](https://github.com/home-lang/pantry/commit/ea993c2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6f6d65b](https://github.com/home-lang/pantry/commit/6f6d65b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9584964](https://github.com/home-lang/pantry/commit/9584964)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([629829e](https://github.com/home-lang/pantry/commit/629829e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5961135](https://github.com/home-lang/pantry/commit/5961135)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([0ef300c](https://github.com/home-lang/pantry/commit/0ef300c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a7869bd](https://github.com/home-lang/pantry/commit/a7869bd)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([fe13251](https://github.com/home-lang/pantry/commit/fe13251)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f255bde](https://github.com/home-lang/pantry/commit/f255bde)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e7b3839](https://github.com/home-lang/pantry/commit/e7b3839)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([be61c56](https://github.com/home-lang/pantry/commit/be61c56)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([fee4da5](https://github.com/home-lang/pantry/commit/fee4da5)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6ee63c1](https://github.com/home-lang/pantry/commit/6ee63c1)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3044915](https://github.com/home-lang/pantry/commit/3044915)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e8c59fc](https://github.com/home-lang/pantry/commit/e8c59fc)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([df0ac65](https://github.com/home-lang/pantry/commit/df0ac65)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5b0ac3b](https://github.com/home-lang/pantry/commit/5b0ac3b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([084352c](https://github.com/home-lang/pantry/commit/084352c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([370ccd2](https://github.com/home-lang/pantry/commit/370ccd2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([369f0c4](https://github.com/home-lang/pantry/commit/369f0c4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f3b0f3e](https://github.com/home-lang/pantry/commit/f3b0f3e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e3296cb](https://github.com/home-lang/pantry/commit/e3296cb)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3b7d92c](https://github.com/home-lang/pantry/commit/3b7d92c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6fe34b9](https://github.com/home-lang/pantry/commit/6fe34b9)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6a6d7d2](https://github.com/home-lang/pantry/commit/6a6d7d2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e6eb970](https://github.com/home-lang/pantry/commit/e6eb970)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c53bcc8](https://github.com/home-lang/pantry/commit/c53bcc8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([786d18a](https://github.com/home-lang/pantry/commit/786d18a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2030447](https://github.com/home-lang/pantry/commit/2030447)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b23c7b1](https://github.com/home-lang/pantry/commit/b23c7b1)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a75eb26](https://github.com/home-lang/pantry/commit/a75eb26)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c66378d](https://github.com/home-lang/pantry/commit/c66378d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4e4446a](https://github.com/home-lang/pantry/commit/4e4446a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3612f82](https://github.com/home-lang/pantry/commit/3612f82)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2188333](https://github.com/home-lang/pantry/commit/2188333)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([699ff9e](https://github.com/home-lang/pantry/commit/699ff9e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3e59e04](https://github.com/home-lang/pantry/commit/3e59e04)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([29c6d33](https://github.com/home-lang/pantry/commit/29c6d33)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e910d94](https://github.com/home-lang/pantry/commit/e910d94)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([afaab01](https://github.com/home-lang/pantry/commit/afaab01)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4dcb550](https://github.com/home-lang/pantry/commit/4dcb550)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([66830e9](https://github.com/home-lang/pantry/commit/66830e9)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([857cf14](https://github.com/home-lang/pantry/commit/857cf14)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d60d157](https://github.com/home-lang/pantry/commit/d60d157)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7973e28](https://github.com/home-lang/pantry/commit/7973e28)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([736b51a](https://github.com/home-lang/pantry/commit/736b51a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6909a52](https://github.com/home-lang/pantry/commit/6909a52)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4eff56d](https://github.com/home-lang/pantry/commit/4eff56d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([57a93ed](https://github.com/home-lang/pantry/commit/57a93ed)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([91fccce](https://github.com/home-lang/pantry/commit/91fccce)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([72305f0](https://github.com/home-lang/pantry/commit/72305f0)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([96ca797](https://github.com/home-lang/pantry/commit/96ca797)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([157736c](https://github.com/home-lang/pantry/commit/157736c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([915ff3b](https://github.com/home-lang/pantry/commit/915ff3b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c289405](https://github.com/home-lang/pantry/commit/c289405)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1063e64](https://github.com/home-lang/pantry/commit/1063e64)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([457a44c](https://github.com/home-lang/pantry/commit/457a44c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ad1df4d](https://github.com/home-lang/pantry/commit/ad1df4d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ebe9e43](https://github.com/home-lang/pantry/commit/ebe9e43)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([56d847a](https://github.com/home-lang/pantry/commit/56d847a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e17f9f0](https://github.com/home-lang/pantry/commit/e17f9f0)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bcad29d](https://github.com/home-lang/pantry/commit/bcad29d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2ff1640](https://github.com/home-lang/pantry/commit/2ff1640)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([31c7b11](https://github.com/home-lang/pantry/commit/31c7b11)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([80d8a99](https://github.com/home-lang/pantry/commit/80d8a99)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([092ca56](https://github.com/home-lang/pantry/commit/092ca56)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2adba8e](https://github.com/home-lang/pantry/commit/2adba8e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([96c24f5](https://github.com/home-lang/pantry/commit/96c24f5)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([833d45e](https://github.com/home-lang/pantry/commit/833d45e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c08421a](https://github.com/home-lang/pantry/commit/c08421a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add debug output for token exchange URL ([1c7ef83](https://github.com/home-lang/pantry/commit/1c7ef83)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([db62ed0](https://github.com/home-lang/pantry/commit/db62ed0)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4c3e809](https://github.com/home-lang/pantry/commit/4c3e809)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b9e7002](https://github.com/home-lang/pantry/commit/b9e7002)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c408ad8](https://github.com/home-lang/pantry/commit/c408ad8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b4dd16c](https://github.com/home-lang/pantry/commit/b4dd16c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9793189](https://github.com/home-lang/pantry/commit/9793189)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ee7fa7b](https://github.com/home-lang/pantry/commit/ee7fa7b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([788d247](https://github.com/home-lang/pantry/commit/788d247)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([0057b02](https://github.com/home-lang/pantry/commit/0057b02)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4425174](https://github.com/home-lang/pantry/commit/4425174)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([fb953af](https://github.com/home-lang/pantry/commit/fb953af)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b1ff626](https://github.com/home-lang/pantry/commit/b1ff626)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([67f7a92](https://github.com/home-lang/pantry/commit/67f7a92)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d19b968](https://github.com/home-lang/pantry/commit/d19b968)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3281dc8](https://github.com/home-lang/pantry/commit/3281dc8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([be26d8e](https://github.com/home-lang/pantry/commit/be26d8e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d9538ed](https://github.com/home-lang/pantry/commit/d9538ed)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([630e6ae](https://github.com/home-lang/pantry/commit/630e6ae)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6484ca3](https://github.com/home-lang/pantry/commit/6484ca3)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9838a78](https://github.com/home-lang/pantry/commit/9838a78)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([514b401](https://github.com/home-lang/pantry/commit/514b401)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2d48c68](https://github.com/home-lang/pantry/commit/2d48c68)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([277135d](https://github.com/home-lang/pantry/commit/277135d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9b7d687](https://github.com/home-lang/pantry/commit/9b7d687)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ed92391](https://github.com/home-lang/pantry/commit/ed92391)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([625096b](https://github.com/home-lang/pantry/commit/625096b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1dcf58a](https://github.com/home-lang/pantry/commit/1dcf58a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([77a1c60](https://github.com/home-lang/pantry/commit/77a1c60)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5fcd6b3](https://github.com/home-lang/pantry/commit/5fcd6b3)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3101779](https://github.com/home-lang/pantry/commit/3101779)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4d476ca](https://github.com/home-lang/pantry/commit/4d476ca)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([555bc87](https://github.com/home-lang/pantry/commit/555bc87)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- remove zig-config sed patches, fixes now in upstream ([f3691d1](https://github.com/home-lang/pantry/commit/f3691d1)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4192988](https://github.com/home-lang/pantry/commit/4192988)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a35cd68](https://github.com/home-lang/pantry/commit/a35cd68)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b0b58f7](https://github.com/home-lang/pantry/commit/b0b58f7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([881d5bc](https://github.com/home-lang/pantry/commit/881d5bc)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a901536](https://github.com/home-lang/pantry/commit/a901536)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([cbd8d1f](https://github.com/home-lang/pantry/commit/cbd8d1f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([00ed1cd](https://github.com/home-lang/pantry/commit/00ed1cd)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a4d3437](https://github.com/home-lang/pantry/commit/a4d3437)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f19a517](https://github.com/home-lang/pantry/commit/f19a517)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ae21541](https://github.com/home-lang/pantry/commit/ae21541)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e52a4a6](https://github.com/home-lang/pantry/commit/e52a4a6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([70d1f52](https://github.com/home-lang/pantry/commit/70d1f52)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([722aa23](https://github.com/home-lang/pantry/commit/722aa23)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6c7b36d](https://github.com/home-lang/pantry/commit/6c7b36d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1c777f9](https://github.com/home-lang/pantry/commit/1c777f9)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a389d1a](https://github.com/home-lang/pantry/commit/a389d1a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7140c9e](https://github.com/home-lang/pantry/commit/7140c9e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e46d898](https://github.com/home-lang/pantry/commit/e46d898)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ef86f21](https://github.com/home-lang/pantry/commit/ef86f21)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2b17a8f](https://github.com/home-lang/pantry/commit/2b17a8f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([65ffd98](https://github.com/home-lang/pantry/commit/65ffd98)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a7daa17](https://github.com/home-lang/pantry/commit/a7daa17)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([69f76ea](https://github.com/home-lang/pantry/commit/69f76ea)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5ee6f74](https://github.com/home-lang/pantry/commit/5ee6f74)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9c2f9f4](https://github.com/home-lang/pantry/commit/9c2f9f4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f6f82ce](https://github.com/home-lang/pantry/commit/f6f82ce)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([31063f6](https://github.com/home-lang/pantry/commit/31063f6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ab5826d](https://github.com/home-lang/pantry/commit/ab5826d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([be75369](https://github.com/home-lang/pantry/commit/be75369)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([025829d](https://github.com/home-lang/pantry/commit/025829d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bcac268](https://github.com/home-lang/pantry/commit/bcac268)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4d243a9](https://github.com/home-lang/pantry/commit/4d243a9)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5e88cd4](https://github.com/home-lang/pantry/commit/5e88cd4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([da17b69](https://github.com/home-lang/pantry/commit/da17b69)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([65b4c2a](https://github.com/home-lang/pantry/commit/65b4c2a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([da82d4a](https://github.com/home-lang/pantry/commit/da82d4a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f827fc2](https://github.com/home-lang/pantry/commit/f827fc2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([91963dd](https://github.com/home-lang/pantry/commit/91963dd)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([dec750c](https://github.com/home-lang/pantry/commit/dec750c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([8c672a5](https://github.com/home-lang/pantry/commit/8c672a5)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2c7217d](https://github.com/home-lang/pantry/commit/2c7217d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e20b049](https://github.com/home-lang/pantry/commit/e20b049)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([719998c](https://github.com/home-lang/pantry/commit/719998c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b9c49db](https://github.com/home-lang/pantry/commit/b9c49db)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([982feff](https://github.com/home-lang/pantry/commit/982feff)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([38a6450](https://github.com/home-lang/pantry/commit/38a6450)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bb6e85a](https://github.com/home-lang/pantry/commit/bb6e85a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([50b0228](https://github.com/home-lang/pantry/commit/50b0228)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([34b7131](https://github.com/home-lang/pantry/commit/34b7131)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c9a7b24](https://github.com/home-lang/pantry/commit/c9a7b24)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([772cad8](https://github.com/home-lang/pantry/commit/772cad8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a822ef7](https://github.com/home-lang/pantry/commit/a822ef7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1f115c8](https://github.com/home-lang/pantry/commit/1f115c8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f867bf8](https://github.com/home-lang/pantry/commit/f867bf8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([5f54c88](https://github.com/home-lang/pantry/commit/5f54c88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c209dae](https://github.com/home-lang/pantry/commit/c209dae)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d22eb34](https://github.com/home-lang/pantry/commit/d22eb34)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([94a80b2](https://github.com/home-lang/pantry/commit/94a80b2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5eef66c](https://github.com/home-lang/pantry/commit/5eef66c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([16ed570](https://github.com/home-lang/pantry/commit/16ed570)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([66cf714](https://github.com/home-lang/pantry/commit/66cf714)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7079f5a](https://github.com/home-lang/pantry/commit/7079f5a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b5ea170](https://github.com/home-lang/pantry/commit/b5ea170)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f143761](https://github.com/home-lang/pantry/commit/f143761)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4b13ae4](https://github.com/home-lang/pantry/commit/4b13ae4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9edca25](https://github.com/home-lang/pantry/commit/9edca25)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e726e93](https://github.com/home-lang/pantry/commit/e726e93)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([8840d3e](https://github.com/home-lang/pantry/commit/8840d3e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4f7f59e](https://github.com/home-lang/pantry/commit/4f7f59e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3321abf](https://github.com/home-lang/pantry/commit/3321abf)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([40be9e2](https://github.com/home-lang/pantry/commit/40be9e2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([761d3c8](https://github.com/home-lang/pantry/commit/761d3c8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([8a9787e](https://github.com/home-lang/pantry/commit/8a9787e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bc2726b](https://github.com/home-lang/pantry/commit/bc2726b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([0319c19](https://github.com/home-lang/pantry/commit/0319c19)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8c9d04d](https://github.com/home-lang/pantry/commit/8c9d04d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e6a8a72](https://github.com/home-lang/pantry/commit/e6a8a72)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([914ec7b](https://github.com/home-lang/pantry/commit/914ec7b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1be3418](https://github.com/home-lang/pantry/commit/1be3418)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3439811](https://github.com/home-lang/pantry/commit/3439811)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6b54cf6](https://github.com/home-lang/pantry/commit/6b54cf6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2030201](https://github.com/home-lang/pantry/commit/2030201)) _(by Chris <chrisbreuer93@gmail.com>)_

### 📄 Miscellaneous

- Update sigstore.zig ([a7d9877](https://github.com/home-lang/pantry/commit/a7d9877)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Update sigstore.zig ([82be7f3](https://github.com/home-lang/pantry/commit/82be7f3)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Update sigstore.zig ([678ffe2](https://github.com/home-lang/pantry/commit/678ffe2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Update sigstore.zig ([6f2a68d](https://github.com/home-lang/pantry/commit/6f2a68d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Revert "chore: wip" ([89d2015](https://github.com/home-lang/pantry/commit/89d2015)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Revert "chore: wip" ([c152d3d](https://github.com/home-lang/pantry/commit/c152d3d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Revert "chore: wip" ([af0c01d](https://github.com/home-lang/pantry/commit/af0c01d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Revert "chore: wip" ([e7efd83](https://github.com/home-lang/pantry/commit/e7efd83)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Update sigstore.zig ([f047412](https://github.com/home-lang/pantry/commit/f047412)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Update io_helper.zig ([e9d2225](https://github.com/home-lang/pantry/commit/e9d2225)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Update build.zig ([5c7253c](https://github.com/home-lang/pantry/commit/5c7253c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Update release.yml ([2b5e250](https://github.com/home-lang/pantry/commit/2b5e250)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- Update helpers.zig ([52eb514](https://github.com/home-lang/pantry/commit/52eb514)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### debug

- disable token fallback to debug OIDC issues ([1f62aa0](https://github.com/home-lang/pantry/commit/1f62aa0)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_
- _head SIGPIPE crash in cargo fallback with set -eo pipefail <Chris>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.8.0...HEAD)

### 🚀 Features

- resolve GitHub tags via API to fix leading-zero version normalization ([4e4a3df](https://github.com/home-lang/pantry/commit/4e4a3df)) _(by Chris <chrisbreuer93@gmail.com>)_
- add targeted build mode for fast CI testing, fix shell expansion bug ([51b37cb](https://github.com/home-lang/pantry/commit/51b37cb)) _(by Chris <chrisbreuer93@gmail.com>)_
- port high-impact brewkit improvements to buildkit ([29b808a](https://github.com/home-lang/pantry/commit/29b808a)) _(by Chris <chrisbreuer93@gmail.com>)_
- add targeted build-package workflow for quick iteration ([fff7504](https://github.com/home-lang/pantry/commit/fff7504)) _(by Chris <chrisbreuer93@gmail.com>)_
- topological sort packages by dependency depth ([e7ccca4](https://github.com/home-lang/pantry/commit/e7ccca4)) _(by Chris <chrisbreuer93@gmail.com>)_
- add buildkit to build all 1159 pantry packages from source ([d11cb59](https://github.com/home-lang/pantry/commit/d11cb59)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🐛 Bug Fixes

- add 117 more packages to known-broken list from run 22169381361 ([bf6f725](https://github.com/home-lang/pantry/commit/bf6f725)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve lint errors in build scripts ([bfca3a6](https://github.com/home-lang/pantry/commit/bfca3a6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add 12 more packages to known-broken list from batches 15-19 ([4764087](https://github.com/home-lang/pantry/commit/4764087)) _(by Chris <chrisbreuer93@gmail.com>)_
- add more packages to known-broken list from batches 13-18 ([78ee16a](https://github.com/home-lang/pantry/commit/78ee16a)) _(by Chris <chrisbreuer93@gmail.com>)_
- add 31 more packages to known-broken list from run 22165206563 ([e441096](https://github.com/home-lang/pantry/commit/e441096)) _(by Chris <chrisbreuer93@gmail.com>)_
- add more packages to known-broken list ([b46c0cd](https://github.com/home-lang/pantry/commit/b46c0cd)) _(by Chris <chrisbreuer93@gmail.com>)_
- add glibtool symlink and ensure /opt/homebrew/bin in PATH on macOS ([be06f76](https://github.com/home-lang/pantry/commit/be06f76)) _(by Chris <chrisbreuer93@gmail.com>)_
- use DYLD_FALLBACK_LIBRARY_PATH on macOS, add missing Linux dev deps ([1829c60](https://github.com/home-lang/pantry/commit/1829c60)) _(by Chris <chrisbreuer93@gmail.com>)_
- prevent sync-binaries runs from being cancelled by new triggers ([ed7364f](https://github.com/home-lang/pantry/commit/ed7364f)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove Debian-patched setuptools/wheel instead of just upgrading ([ae9db43](https://github.com/home-lang/pantry/commit/ae9db43)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve Python setuptools install_layout and missing Go on macOS ([a068637](https://github.com/home-lang/pantry/commit/a068637)) _(by Chris <chrisbreuer93@gmail.com>)_
- isolate cargo/rustup per-build and add gfortran support ([2eb35e8](https://github.com/home-lang/pantry/commit/2eb35e8)) _(by Chris <chrisbreuer93@gmail.com>)_
- prevent find ([5a22773](https://github.com/home-lang/pantry/commit/5a22773)) _(by head SIGPIPE crash in cargo fallback with set -eo pipefail <Chris>)_
- BSD sed compatibility, findYamls traversal bug, and string build detection ([7dd7dde](https://github.com/home-lang/pantry/commit/7dd7dde)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve cargo PATH detection, macOS deployment target, and obsolete linker flags ([5cd9fad](https://github.com/home-lang/pantry/commit/5cd9fad)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle trailing .0 in version matching and multiline transform regex ([87e6dfd](https://github.com/home-lang/pantry/commit/87e6dfd)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle more build edge cases (permissions, .war files, cargo-c, libxslt) ([8ba5dda](https://github.com/home-lang/pantry/commit/8ba5dda)) _(by Chris <chrisbreuer93@gmail.com>)_
- clear bash hash table before build script to fix cargo not found ([61edcec](https://github.com/home-lang/pantry/commit/61edcec)) _(by Chris <chrisbreuer93@gmail.com>)_
- windows cross-compilation errors in io_helper, extractor, installer, package ([5d8f500](https://github.com/home-lang/pantry/commit/5d8f500)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add 8 more packages to known broken list ([49fa72d](https://github.com/home-lang/pantry/commit/49fa72d)) _(by Chris <chrisbreuer93@gmail.com>)_
- lint errors ([fd65216](https://github.com/home-lang/pantry/commit/fd65216)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- lint errors ([fe47b06](https://github.com/home-lang/pantry/commit/fe47b06)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add docker.com/cli, reshape, frei0r to known broken list ([9a51dd2](https://github.com/home-lang/pantry/commit/9a51dd2)) _(by Chris <chrisbreuer93@gmail.com>)_
- don't override recipe GOPATH in Go toolchain setup ([a436340](https://github.com/home-lang/pantry/commit/a436340)) _(by Chris <chrisbreuer93@gmail.com>)_
- add python-venv.py script shim for pkgx YAML recipes ([ab71b50](https://github.com/home-lang/pantry/commit/ab71b50)) _(by Chris <chrisbreuer93@gmail.com>)_
- reduce per-package timeout to 30 min and add batch time budget ([9d257d6](https://github.com/home-lang/pantry/commit/9d257d6)) _(by Chris <chrisbreuer93@gmail.com>)_
- strip YAML quotes from array items in parser ([74bbf54](https://github.com/home-lang/pantry/commit/74bbf54)) _(by Chris <chrisbreuer93@gmail.com>)_
- create cargo symlinks before Rust toolchain search ([90042e8](https://github.com/home-lang/pantry/commit/90042e8)) _(by Chris <chrisbreuer93@gmail.com>)_
- source rustup env for reliable cargo discovery + add diagnostics ([722092f](https://github.com/home-lang/pantry/commit/722092f)) _(by Chris <chrisbreuer93@gmail.com>)_
- add pwmt.org/girara and zathura to knownBrokenDomains ([a9d0af7](https://github.com/home-lang/pantry/commit/a9d0af7)) _(by Chris <chrisbreuer93@gmail.com>)_
- move x.org/x11 local-transport override from YAML to buildkit code ([a5afa52](https://github.com/home-lang/pantry/commit/a5afa52)) _(by Chris <chrisbreuer93@gmail.com>)_
- only activate GCC specs workaround on Linux, not macOS ([a36f6d8](https://github.com/home-lang/pantry/commit/a36f6d8)) _(by Chris <chrisbreuer93@gmail.com>)_
- disable local-transport for x.org/x11 on Linux (sys/stropts.h removed in glibc 2.38+) ([06e31c4](https://github.com/home-lang/pantry/commit/06e31c4)) _(by Chris <chrisbreuer93@gmail.com>)_
- correct YAML multiline scalar continuation indent from +4 to +2 ([4b01ce1](https://github.com/home-lang/pantry/commit/4b01ce1)) _(by Chris <chrisbreuer93@gmail.com>)_
- show tail of generated build script on failure to see user commands ([0dae0c7](https://github.com/home-lang/pantry/commit/0dae0c7)) _(by Chris <chrisbreuer93@gmail.com>)_
- don't add default -o for preprocessor invocations in specs workaround ([073fb43](https://github.com/home-lang/pantry/commit/073fb43)) _(by Chris <chrisbreuer93@gmail.com>)_
- also wrap cpp in cc_wrapper to handle ./specs directory ([75a4c0e](https://github.com/home-lang/pantry/commit/75a4c0e)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle default output paths in GCC specs workaround ([89a91e7](https://github.com/home-lang/pantry/commit/89a91e7)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve diagnostics for GCC specs workaround debugging ([c7795e0](https://github.com/home-lang/pantry/commit/c7795e0)) _(by Chris <chrisbreuer93@gmail.com>)_
- work around GCC ./specs directory issue via cc_wrapper CWD change ([4bc10e3](https://github.com/home-lang/pantry/commit/4bc10e3)) _(by Chris <chrisbreuer93@gmail.com>)_
- use GCC_EXEC_PREFIX to prevent ./specs directory confusion on Linux ([e273abf](https://github.com/home-lang/pantry/commit/e273abf)) _(by Chris <chrisbreuer93@gmail.com>)_
- work around GCC ./specs directory issue on Linux ([d5d3fb5](https://github.com/home-lang/pantry/commit/d5d3fb5)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve compiler diagnostic to test with CFLAGS+LDFLAGS ([6ef920f](https://github.com/home-lang/pantry/commit/6ef920f)) _(by Chris <chrisbreuer93@gmail.com>)_
- add compiler diagnostics + config.log dump for build failures ([59b2079](https://github.com/home-lang/pantry/commit/59b2079)) _(by Chris <chrisbreuer93@gmail.com>)_
- increase per-package timeout to 60 min (codex needs ~50 min) ([093f1e7](https://github.com/home-lang/pantry/commit/093f1e7)) _(by Chris <chrisbreuer93@gmail.com>)_
- add libcap-dev for codex, add broken Rust packages to skip list ([fdbb487](https://github.com/home-lang/pantry/commit/fdbb487)) _(by Chris <chrisbreuer93@gmail.com>)_
- increase per-package build timeout to 45 min for large Rust builds ([91a9136](https://github.com/home-lang/pantry/commit/91a9136)) _(by Chris <chrisbreuer93@gmail.com>)_
- add broken packages to skip lists based on run analysis ([e11c955](https://github.com/home-lang/pantry/commit/e11c955)) _(by Chris <chrisbreuer93@gmail.com>)_
- persist cargo PATH via GITHUB_PATH, add broken packages to skip list ([45104bd](https://github.com/home-lang/pantry/commit/45104bd)) _(by Chris <chrisbreuer93@gmail.com>)_
- use GCC-compatible CFLAGS on Linux (-Wno-error=incompatible-pointer-types) ([247f5ae](https://github.com/home-lang/pantry/commit/247f5ae)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove Linux LDFLAGS that breaks configure compiler tests ([01c9eb8](https://github.com/home-lang/pantry/commit/01c9eb8)) _(by Chris <chrisbreuer93@gmail.com>)_
- upgrade to macOS 15 runners, add Swift 6.2 support, fix pip/Rust/multiarch issues ([7f290b0](https://github.com/home-lang/pantry/commit/7f290b0)) _(by Chris <chrisbreuer93@gmail.com>)_
- add Linux LDFLAGS and relax warnings-as-errors ([040f365](https://github.com/home-lang/pantry/commit/040f365)) _(by Chris <chrisbreuer93@gmail.com>)_
- comprehensive CI system packages, GNU mirror, and broken domain fixes ([b81a75c](https://github.com/home-lang/pantry/commit/b81a75c)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve cargo discovery and CMake compatibility in buildkit ([2a85661](https://github.com/home-lang/pantry/commit/2a85661)) _(by Chris <chrisbreuer93@gmail.com>)_
- add --without-icu to postgresql/libpq recipe ([bad1bba](https://github.com/home-lang/pantry/commit/bad1bba)) _(by Chris <chrisbreuer93@gmail.com>)_
- hardcoded version URLs, broken recipes, update Rust toolchain ([59dd742](https://github.com/home-lang/pantry/commit/59dd742)) _(by Chris <chrisbreuer93@gmail.com>)_
- prevent update-pantry from overwriting local recipe fixes ([69d377c](https://github.com/home-lang/pantry/commit/69d377c)) _(by Chris <chrisbreuer93@gmail.com>)_
- use {{version}} in distributable URLs instead of hardcoded versions ([637bceb](https://github.com/home-lang/pantry/commit/637bceb)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML parser array-at-same-indent bug, install -D shim, darwin CFLAGS ([f407f44](https://github.com/home-lang/pantry/commit/f407f44)) _(by Chris <chrisbreuer93@gmail.com>)_
- compiler wrapper heredoc parsing error (Unexpected @) ([07ef845](https://github.com/home-lang/pantry/commit/07ef845)) _(by Chris <chrisbreuer93@gmail.com>)_
- reduce knownBrokenDomains, fix berkeley-db recipe ([f47b966](https://github.com/home-lang/pantry/commit/f47b966)) _(by Chris <chrisbreuer93@gmail.com>)_
- PYTHONPATH for system Python modules, add missing macOS deps, fix pkgm strip-components ([d12177f](https://github.com/home-lang/pantry/commit/d12177f)) _(by Chris <chrisbreuer93@gmail.com>)_
- pass packages as comma-separated to -p (parseArgs only keeps last) ([e15e6fd](https://github.com/home-lang/pantry/commit/e15e6fd)) _(by Chris <chrisbreuer93@gmail.com>)_
- bypass all filters for targeted builds + add python3-libxml2 to CI ([7799162](https://github.com/home-lang/pantry/commit/7799162)) _(by Chris <chrisbreuer93@gmail.com>)_
- -p flag now bypasses knownBroken/toolchain filters for targeted builds ([e0aa369](https://github.com/home-lang/pantry/commit/e0aa369)) _(by Chris <chrisbreuer93@gmail.com>)_
- add missing system deps to CI, remove fixable packages from knownBroken ([ffe09cf](https://github.com/home-lang/pantry/commit/ffe09cf)) _(by Chris <chrisbreuer93@gmail.com>)_
- ln wrapper, cargo detection, recipe fixes, knownBroken updates ([d8f6cf1](https://github.com/home-lang/pantry/commit/d8f6cf1)) _(by Chris <chrisbreuer93@gmail.com>)_
- symlink cargo/rustup into overridden HOME + URL safety ([9b5eb4a](https://github.com/home-lang/pantry/commit/9b5eb4a)) _(by Chris <chrisbreuer93@gmail.com>)_
- move SRCROOT setup before recipe env for proper overrides ([f1c1d7d](https://github.com/home-lang/pantry/commit/f1c1d7d)) _(by Chris <chrisbreuer93@gmail.com>)_
- more recipe fixes for zip strip-components conflicts ([6a44024](https://github.com/home-lang/pantry/commit/6a44024)) _(by Chris <chrisbreuer93@gmail.com>)_
- recipe fixes and non-archive download handling ([48dec17](https://github.com/home-lang/pantry/commit/48dec17)) _(by Chris <chrisbreuer93@gmail.com>)_
- always cd to buildDir before working-directory subdirectory ([86c249a](https://github.com/home-lang/pantry/commit/86c249a)) _(by Chris <chrisbreuer93@gmail.com>)_
- auto-detect system dep prefix for toolchain packages ([8b84407](https://github.com/home-lang/pantry/commit/8b84407)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove exported bash functions that pollute child process environments ([20f4ea8](https://github.com/home-lang/pantry/commit/20f4ea8)) _(by Chris <chrisbreuer93@gmail.com>)_
- add missing system build deps to CI workflow ([50c3bb1](https://github.com/home-lang/pantry/commit/50c3bb1)) _(by Chris <chrisbreuer93@gmail.com>)_
- prop heredoc escaping, JAVA_HOME detection, download retries ([1b64a4b](https://github.com/home-lang/pantry/commit/1b64a4b)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve multiple build failures for pantry package compilation ([920a382](https://github.com/home-lang/pantry/commit/920a382)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML parser URL detection regression - use looksLikeKeyValue ([2be356e](https://github.com/home-lang/pantry/commit/2be356e)) _(by Chris <chrisbreuer93@gmail.com>)_
- strip YAML inline comments from parser values ([8f0a67f](https://github.com/home-lang/pantry/commit/8f0a67f)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML dep extraction, platform filtering, meson venv, install -D shim, URL parsing ([723d92b](https://github.com/home-lang/pantry/commit/723d92b)) _(by Chris <chrisbreuer93@gmail.com>)_
- strip trailing .0 from versions on download failure ([9168e87](https://github.com/home-lang/pantry/commit/9168e87)) _(by Chris <chrisbreuer93@gmail.com>)_
- fix pkg-config in downloaded deps, add system pkg-config paths ([946b4b6](https://github.com/home-lang/pantry/commit/946b4b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- version fallback, meson venv, dep path pollution, fix-shebangs shim, direct build arrays ([9651099](https://github.com/home-lang/pantry/commit/9651099)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle multi-line plain scalar continuation in YAML arrays ([520c4db](https://github.com/home-lang/pantry/commit/520c4db)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML parser overhaul for run arrays, working-directory, inline mappings ([82675e3](https://github.com/home-lang/pantry/commit/82675e3)) _(by Chris <chrisbreuer93@gmail.com>)_
- URL-encode source URLs and validate download size ([5bb5519](https://github.com/home-lang/pantry/commit/5bb5519)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve Go GOROOT mismatch, -pie LDFLAGS, and version 404s ([e9cc094](https://github.com/home-lang/pantry/commit/e9cc094)) _(by Chris <chrisbreuer93@gmail.com>)_
- YAML parser for if:/working-directory, skip broken recipes, exit 0 ([42eddc9](https://github.com/home-lang/pantry/commit/42eddc9)) _(by Chris <chrisbreuer93@gmail.com>)_
- preserve system toolchains, add shims, smart filtering ([fcfcbf0](https://github.com/home-lang/pantry/commit/fcfcbf0)) _(by Chris <chrisbreuer93@gmail.com>)_
- complex strip patterns, GNU sed on macOS, regex for nested / ([ba6a319](https://github.com/home-lang/pantry/commit/ba6a319)) _(by Chris <chrisbreuer93@gmail.com>)_
- handle git+https sources, smart version.tag, exit non-zero on failures ([e60712a](https://github.com/home-lang/pantry/commit/e60712a)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve template interpolation, YAML parsing, S3 binary download issues ([e3f6c53](https://github.com/home-lang/pantry/commit/e3f6c53)) _(by Chris <chrisbreuer93@gmail.com>)_
- prevent batch crash on cleanup errors, fix compiler flag ordering ([73f16d7](https://github.com/home-lang/pantry/commit/73f16d7)) _(by Chris <chrisbreuer93@gmail.com>)_
- dynamic python version, linux build deps for postgres ([dce1638](https://github.com/home-lang/pantry/commit/dce1638)) _(by Chris <chrisbreuer93@gmail.com>)_
- add Linux support for postgres/mysql, update python URL ([8e48f3d](https://github.com/home-lang/pantry/commit/8e48f3d)) _(by Chris <chrisbreuer93@gmail.com>)_
- use direct symlink instead of bun link for ts-cloud in CI ([5ca7dfe](https://github.com/home-lang/pantry/commit/5ca7dfe)) _(by Chris <chrisbreuer93@gmail.com>)_
- use ts-cloud via bun link for S3 operations ([41c3aa8](https://github.com/home-lang/pantry/commit/41c3aa8)) _(by Chris <chrisbreuer93@gmail.com>)_
- resolve module resolution and GitHub API rate limits in CI ([43de03f](https://github.com/home-lang/pantry/commit/43de03f)) _(by Chris <chrisbreuer93@gmail.com>)_

### ⚡ Performance Improvements

- cache brew packages and increase parallelism for faster CI ([ff9d41f](https://github.com/home-lang/pantry/commit/ff9d41f)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🧹 Chores

- wip ([7945247](https://github.com/home-lang/pantry/commit/7945247)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update freetds, LLaMA.cpp ([c4a76f0](https://github.com/home-lang/pantry/commit/c4a76f0)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update virtualenv ([be10292](https://github.com/home-lang/pantry/commit/be10292)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update apko ([bd992ff](https://github.com/home-lang/pantry/commit/bd992ff)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update consul, LLaMA.cpp, tox ([b12c174](https://github.com/home-lang/pantry/commit/b12c174)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cargo-tarpaulin, depot, z3, vals ([4e30f88](https://github.com/home-lang/pantry/commit/4e30f88)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, vals, pulumi ([e14f64d](https://github.com/home-lang/pantry/commit/e14f64d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update filelock, vcluster ([cb20fc5](https://github.com/home-lang/pantry/commit/cb20fc5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update ia ([dbda8c1](https://github.com/home-lang/pantry/commit/dbda8c1)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update azcopy ([0261b94](https://github.com/home-lang/pantry/commit/0261b94)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli, spec-kit, moon, vim ([70dce0b](https://github.com/home-lang/pantry/commit/70dce0b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws-sdk-cpp, LLaMA.cpp, glab, vim ([1978471](https://github.com/home-lang/pantry/commit/1978471)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update crush, LLaMA.cpp, terragrunt ([cb03b00](https://github.com/home-lang/pantry/commit/cb03b00)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli, tox ([bd2a1e5](https://github.com/home-lang/pantry/commit/bd2a1e5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update fly, gcloud ([9ad196b](https://github.com/home-lang/pantry/commit/9ad196b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, psycopg3, vim ([984b7e9](https://github.com/home-lang/pantry/commit/984b7e9)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update syft, gh, flipt, hugo, jenkins-lts and 1 other dep ([45805c7](https://github.com/home-lang/pantry/commit/45805c7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- set max-parallel to 8 ([f4def27](https://github.com/home-lang/pantry/commit/f4def27)) _(by Chris <chrisbreuer93@gmail.com>)_
- update bind9, soliditylang, vim ([2fecdc7](https://github.com/home-lang/pantry/commit/2fecdc7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- regenerate package catalog ([689e032](https://github.com/home-lang/pantry/commit/689e032)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update squidfunk/mkdocs-material ([677b7a3](https://github.com/home-lang/pantry/commit/677b7a3)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([f6e16b2](https://github.com/home-lang/pantry/commit/f6e16b2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([12bf88f](https://github.com/home-lang/pantry/commit/12bf88f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- release v0.8.1 ([e095dda](https://github.com/home-lang/pantry/commit/e095dda)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update loki, tailwindcss ([c928bd2](https://github.com/home-lang/pantry/commit/c928bd2)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([93d568b](https://github.com/home-lang/pantry/commit/93d568b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update argo-cd, periphery ([4140bec](https://github.com/home-lang/pantry/commit/4140bec)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update argo-cd, checkov, rtx-cli, sk and 3 other deps ([61de58a](https://github.com/home-lang/pantry/commit/61de58a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([9e0f4e7](https://github.com/home-lang/pantry/commit/9e0f4e7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update casdoor, LLaMA.cpp ([5a6c0a2](https://github.com/home-lang/pantry/commit/5a6c0a2)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update libgpg-error ([4a9f15b](https://github.com/home-lang/pantry/commit/4a9f15b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([887d98b](https://github.com/home-lang/pantry/commit/887d98b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update checkov ([87a55c1](https://github.com/home-lang/pantry/commit/87a55c1)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, opa ([adb8f11](https://github.com/home-lang/pantry/commit/adb8f11)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, codex ([406e812](https://github.com/home-lang/pantry/commit/406e812)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update taglib-config ([a328803](https://github.com/home-lang/pantry/commit/a328803)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update mas, laravel, pulumi ([bbfdfba](https://github.com/home-lang/pantry/commit/bbfdfba)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([3630b5b](https://github.com/home-lang/pantry/commit/3630b5b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update codex ([22d8a8f](https://github.com/home-lang/pantry/commit/22d8a8f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update Arkade ([88b54f4](https://github.com/home-lang/pantry/commit/88b54f4)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update uv, LLaMA.cpp ([16a9a71](https://github.com/home-lang/pantry/commit/16a9a71)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws-sdk-cpp ([fbbc5e1](https://github.com/home-lang/pantry/commit/fbbc5e1)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli, aws-iam-authenticator, tox ([084c85f](https://github.com/home-lang/pantry/commit/084c85f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update pik, odigos, codex ([89acad3](https://github.com/home-lang/pantry/commit/89acad3)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update fly, glab ([c627a24](https://github.com/home-lang/pantry/commit/c627a24)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update kargo, spider, stripe, tox, vim ([bc9e0d8](https://github.com/home-lang/pantry/commit/bc9e0d8)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update rclone ([148208c](https://github.com/home-lang/pantry/commit/148208c)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update werf ([8fafbcb](https://github.com/home-lang/pantry/commit/8fafbcb)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cnquery, deno, mvfst, golangci-lint and 1 other dep ([e17e707](https://github.com/home-lang/pantry/commit/e17e707)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([40b5332](https://github.com/home-lang/pantry/commit/40b5332)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([dd12f2b](https://github.com/home-lang/pantry/commit/dd12f2b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update uv, rtx-cli, mise, openstack, pnp and 2 other deps ([e3be051](https://github.com/home-lang/pantry/commit/e3be051)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([b89aade](https://github.com/home-lang/pantry/commit/b89aade)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update llrt, golangci-lint, rucio-client ([362b519](https://github.com/home-lang/pantry/commit/362b519)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([9a2f598](https://github.com/home-lang/pantry/commit/9a2f598)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update casdoor, elementsproject, LLaMA.cpp and 2 other deps ([94866f5](https://github.com/home-lang/pantry/commit/94866f5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update babashka, rtx-cli, apko ([4f810ce](https://github.com/home-lang/pantry/commit/4f810ce)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([7288eca](https://github.com/home-lang/pantry/commit/7288eca)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update cnquery, LLaMA.cpp, mise ([16b8e50](https://github.com/home-lang/pantry/commit/16b8e50)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cilium ([a5cc21c](https://github.com/home-lang/pantry/commit/a5cc21c)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update freetds ([3697308](https://github.com/home-lang/pantry/commit/3697308)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update pocketbase ([eecd4d5](https://github.com/home-lang/pantry/commit/eecd4d5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update ghq ([fb43462](https://github.com/home-lang/pantry/commit/fb43462)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([d284c2a](https://github.com/home-lang/pantry/commit/d284c2a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- add Go 1.26 incompatible packages to knownBrokenDomains ([479e6ae](https://github.com/home-lang/pantry/commit/479e6ae)) _(by Chris <chrisbreuer93@gmail.com>)_
- update LLaMA.cpp ([4e005d9](https://github.com/home-lang/pantry/commit/4e005d9)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- add jetporch.com to knownBrokenDomains ([c3241fe](https://github.com/home-lang/pantry/commit/c3241fe)) _(by Chris <chrisbreuer93@gmail.com>)_
- add more entries to knownBrokenDomains ([3251b64](https://github.com/home-lang/pantry/commit/3251b64)) _(by Chris <chrisbreuer93@gmail.com>)_
- update LLaMA.cpp ([f89108d](https://github.com/home-lang/pantry/commit/f89108d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws-sdk-cpp, LLaMA.cpp, rabbitmq and 3 other deps ([e6e7604](https://github.com/home-lang/pantry/commit/e6e7604)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (12 files) ([89bd31b](https://github.com/home-lang/pantry/commit/89bd31b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update biome, fish, cirrus, ollama ([e934b6a](https://github.com/home-lang/pantry/commit/e934b6a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (2 files) ([0586cdd](https://github.com/home-lang/pantry/commit/0586cdd)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update vim ([edd155e](https://github.com/home-lang/pantry/commit/edd155e)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws-sdk-cpp, kafka.apache, linux-headers, vim ([0f09d5c](https://github.com/home-lang/pantry/commit/0f09d5c)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli, linux-headers, oh-my-posh ([2384b7b](https://github.com/home-lang/pantry/commit/2384b7b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (7 files) ([20e3a71](https://github.com/home-lang/pantry/commit/20e3a71)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update aws/cli ([62f2681](https://github.com/home-lang/pantry/commit/62f2681)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update opencode.ai ([7ed9e3f](https://github.com/home-lang/pantry/commit/7ed9e3f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update fly, LLaMA.cpp ([12d2e17](https://github.com/home-lang/pantry/commit/12d2e17)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update istioctl ([c352540](https://github.com/home-lang/pantry/commit/c352540)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update surreal ([8890ac5](https://github.com/home-lang/pantry/commit/8890ac5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update biome, edencommon, fb303, thrift1 and 4 other deps ([e2738fb](https://github.com/home-lang/pantry/commit/e2738fb)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, typos, linux-headers, oh-my-posh ([6b0b146](https://github.com/home-lang/pantry/commit/6b0b146)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update argo-workflows ([4fecfe2](https://github.com/home-lang/pantry/commit/4fecfe2)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([5982ba6](https://github.com/home-lang/pantry/commit/5982ba6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update maturin, rucio-client ([4121012](https://github.com/home-lang/pantry/commit/4121012)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update arrow, LLaMA.cpp, kubebuilder ([486de65](https://github.com/home-lang/pantry/commit/486de65)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([19f5695](https://github.com/home-lang/pantry/commit/19f5695)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4da3bd3](https://github.com/home-lang/pantry/commit/4da3bd3)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6497935](https://github.com/home-lang/pantry/commit/6497935)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([b7bd8fb](https://github.com/home-lang/pantry/commit/b7bd8fb)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d1aa838](https://github.com/home-lang/pantry/commit/d1aa838)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update k6 ([5bde90f](https://github.com/home-lang/pantry/commit/5bde90f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([ebb58b7](https://github.com/home-lang/pantry/commit/ebb58b7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update odigos, openapi-generator ([c0ab59a](https://github.com/home-lang/pantry/commit/c0ab59a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([269e372](https://github.com/home-lang/pantry/commit/269e372)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([84013ec](https://github.com/home-lang/pantry/commit/84013ec)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update casdoor, checkov, iproute2mac, LLaMA.cpp ([21d2fa3](https://github.com/home-lang/pantry/commit/21d2fa3)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update maturin ([8a7a8d4](https://github.com/home-lang/pantry/commit/8a7a8d4)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update soldeer ([54766ab](https://github.com/home-lang/pantry/commit/54766ab)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update platformdirs ([b0b5792](https://github.com/home-lang/pantry/commit/b0b5792)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cirrus, filelock, libsoup ([10474d5](https://github.com/home-lang/pantry/commit/10474d5)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([fa2e226](https://github.com/home-lang/pantry/commit/fa2e226)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update apko ([22ad35d](https://github.com/home-lang/pantry/commit/22ad35d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([9996ab2](https://github.com/home-lang/pantry/commit/9996ab2)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update qsv ([4b82c9a](https://github.com/home-lang/pantry/commit/4b82c9a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([b8408a8](https://github.com/home-lang/pantry/commit/b8408a8)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([8be542a](https://github.com/home-lang/pantry/commit/8be542a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update filelock ([6474a41](https://github.com/home-lang/pantry/commit/6474a41)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([07f08ae](https://github.com/home-lang/pantry/commit/07f08ae)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update tox ([a96249e](https://github.com/home-lang/pantry/commit/a96249e)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update opencode.ai ([8df4081](https://github.com/home-lang/pantry/commit/8df4081)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, LLaMA.cpp ([7c98299](https://github.com/home-lang/pantry/commit/7c98299)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([763a7d7](https://github.com/home-lang/pantry/commit/763a7d7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update vim ([42dc8f7](https://github.com/home-lang/pantry/commit/42dc8f7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update biome, LLaMA.cpp, vim ([f5a9f24](https://github.com/home-lang/pantry/commit/f5a9f24)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, vim ([7be0d16](https://github.com/home-lang/pantry/commit/7be0d16)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cirrus ([a1c887a](https://github.com/home-lang/pantry/commit/a1c887a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, vim ([218ef88](https://github.com/home-lang/pantry/commit/218ef88)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, sing-box, vim ([e5b39b8](https://github.com/home-lang/pantry/commit/e5b39b8)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor, iproute2mac ([6f9cfa1](https://github.com/home-lang/pantry/commit/6f9cfa1)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update glab ([fa1411d](https://github.com/home-lang/pantry/commit/fa1411d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update ducker ([0e3828b](https://github.com/home-lang/pantry/commit/0e3828b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([11ca868](https://github.com/home-lang/pantry/commit/11ca868)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update rtx-cli, mise ([9cb20f7](https://github.com/home-lang/pantry/commit/9cb20f7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([aa660d0](https://github.com/home-lang/pantry/commit/aa660d0)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([72d249a](https://github.com/home-lang/pantry/commit/72d249a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update casdoor ([1955d05](https://github.com/home-lang/pantry/commit/1955d05)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([4263261](https://github.com/home-lang/pantry/commit/4263261)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([ee58a1a](https://github.com/home-lang/pantry/commit/ee58a1a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([fbff7f7](https://github.com/home-lang/pantry/commit/fbff7f7)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update opencode.ai ([5b81418](https://github.com/home-lang/pantry/commit/5b81418)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update cover image ([a0c03fb](https://github.com/home-lang/pantry/commit/a0c03fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- update opencode.ai, sbt ([50076bb](https://github.com/home-lang/pantry/commit/50076bb)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update periphery ([b394c43](https://github.com/home-lang/pantry/commit/b394c43)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([d5bf4fa](https://github.com/home-lang/pantry/commit/d5bf4fa)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, libsoup ([ab7c27f](https://github.com/home-lang/pantry/commit/ab7c27f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([a8b1b6a](https://github.com/home-lang/pantry/commit/a8b1b6a)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp, platformdirs ([5b2f07f](https://github.com/home-lang/pantry/commit/5b2f07f)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update LLaMA.cpp ([5ff4902](https://github.com/home-lang/pantry/commit/5ff4902)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- update registry data (1 file) ([c148a5b](https://github.com/home-lang/pantry/commit/c148a5b)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([6824026](https://github.com/home-lang/pantry/commit/6824026)) _(by Chris <chrisbreuer93@gmail.com>)_
- update abseil, acorn, Auto-GPT, git-crypt and 16 other deps ([ab7d41d](https://github.com/home-lang/pantry/commit/ab7d41d)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- minor cleanup ([13d313a](https://github.com/home-lang/pantry/commit/13d313a)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve `update-packages` and `update-pantry` ([584dbd0](https://github.com/home-lang/pantry/commit/584dbd0)) _(by Chris <chrisbreuer93@gmail.com>)_
- move docs ([871a1ec](https://github.com/home-lang/pantry/commit/871a1ec)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve safeguard logic ([8719cc3](https://github.com/home-lang/pantry/commit/8719cc3)) _(by Chris <chrisbreuer93@gmail.com>)_
- minor updates ([db024c1](https://github.com/home-lang/pantry/commit/db024c1)) _(by Chris <chrisbreuer93@gmail.com>)_
- update registry data (8 files) ([04a45e0](https://github.com/home-lang/pantry/commit/04a45e0)) _(by [github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>](https://github.com/github-actions[bot]))_
- wip ([af5ed61](https://github.com/home-lang/pantry/commit/af5ed61)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([901c867](https://github.com/home-lang/pantry/commit/901c867)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7ad4dd3](https://github.com/home-lang/pantry/commit/7ad4dd3)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_
- _head SIGPIPE crash in cargo fallback with set -eo pipefail <Chris>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.4...v0.7.5)

### 🧹 Chores

- release v0.7.5 ([9a83ca5](https://github.com/home-lang/pantry/commit/9a83ca5)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.3...v0.7.4)

### 🧹 Chores

- release v0.7.4 ([1eb8c7e](https://github.com/home-lang/pantry/commit/1eb8c7e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a654f6b](https://github.com/home-lang/pantry/commit/a654f6b)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.3...HEAD)

### 🧹 Chores

- wip ([a654f6b](https://github.com/home-lang/pantry/commit/a654f6b)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.2...v0.7.3)

### 🧹 Chores

- release v0.7.3 ([e4327a8](https://github.com/home-lang/pantry/commit/e4327a8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9f10c29](https://github.com/home-lang/pantry/commit/9f10c29)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.2...HEAD)

### 🧹 Chores

- wip ([9f10c29](https://github.com/home-lang/pantry/commit/9f10c29)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.1...v0.7.2)

### 🧹 Chores

- release v0.7.2 ([edd11bf](https://github.com/home-lang/pantry/commit/edd11bf)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1b9714b](https://github.com/home-lang/pantry/commit/1b9714b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8e5f73b](https://github.com/home-lang/pantry/commit/8e5f73b)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.1...HEAD)

### 🧹 Chores

- wip ([1b9714b](https://github.com/home-lang/pantry/commit/1b9714b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8e5f73b](https://github.com/home-lang/pantry/commit/8e5f73b)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.0...v0.7.1)

### 🧹 Chores

- release v0.7.1 ([8ef4fa5](https://github.com/home-lang/pantry/commit/8ef4fa5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7f688ba](https://github.com/home-lang/pantry/commit/7f688ba)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e29a1f5](https://github.com/home-lang/pantry/commit/e29a1f5)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.7.0...HEAD)

### 🧹 Chores

- wip ([7f688ba](https://github.com/home-lang/pantry/commit/7f688ba)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e29a1f5](https://github.com/home-lang/pantry/commit/e29a1f5)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/v0.6.4...v0.7.0)

### 🧹 Chores

- release v0.7.0 ([e59a3e4](https://github.com/home-lang/pantry/commit/e59a3e4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([37419e2](https://github.com/home-lang/pantry/commit/37419e2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7a8b56e](https://github.com/home-lang/pantry/commit/7a8b56e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7cdbb29](https://github.com/home-lang/pantry/commit/7cdbb29)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([71ebb88](https://github.com/home-lang/pantry/commit/71ebb88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5d61b6a](https://github.com/home-lang/pantry/commit/5d61b6a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([909bfe0](https://github.com/home-lang/pantry/commit/909bfe0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3de09a4](https://github.com/home-lang/pantry/commit/3de09a4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bce9611](https://github.com/home-lang/pantry/commit/bce9611)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c751514](https://github.com/home-lang/pantry/commit/c751514)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c7ceb66](https://github.com/home-lang/pantry/commit/c7ceb66)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a5cd20c](https://github.com/home-lang/pantry/commit/a5cd20c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c21924c](https://github.com/home-lang/pantry/commit/c21924c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9a9b17b](https://github.com/home-lang/pantry/commit/9a9b17b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([abce88a](https://github.com/home-lang/pantry/commit/abce88a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([89ceec0](https://github.com/home-lang/pantry/commit/89ceec0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1292afc](https://github.com/home-lang/pantry/commit/1292afc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7c98087](https://github.com/home-lang/pantry/commit/7c98087)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3ccd81a](https://github.com/home-lang/pantry/commit/3ccd81a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cac2daa](https://github.com/home-lang/pantry/commit/cac2daa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7321143](https://github.com/home-lang/pantry/commit/7321143)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([285851e](https://github.com/home-lang/pantry/commit/285851e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d8155a](https://github.com/home-lang/pantry/commit/1d8155a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dc3e607](https://github.com/home-lang/pantry/commit/dc3e607)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c908887](https://github.com/home-lang/pantry/commit/c908887)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([06b8a95](https://github.com/home-lang/pantry/commit/06b8a95)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([61bcb3a](https://github.com/home-lang/pantry/commit/61bcb3a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([11225ec](https://github.com/home-lang/pantry/commit/11225ec)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([804b146](https://github.com/home-lang/pantry/commit/804b146)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7858565](https://github.com/home-lang/pantry/commit/7858565)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a037ea6](https://github.com/home-lang/pantry/commit/a037ea6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f7b8894](https://github.com/home-lang/pantry/commit/f7b8894)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a42ca1f](https://github.com/home-lang/pantry/commit/a42ca1f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d0189b6](https://github.com/home-lang/pantry/commit/d0189b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([87ab9ce](https://github.com/home-lang/pantry/commit/87ab9ce)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([01fa7ea](https://github.com/home-lang/pantry/commit/01fa7ea)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ce4f45f](https://github.com/home-lang/pantry/commit/ce4f45f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([94a846c](https://github.com/home-lang/pantry/commit/94a846c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([75a5511](https://github.com/home-lang/pantry/commit/75a5511)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([61917b5](https://github.com/home-lang/pantry/commit/61917b5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0f46a88](https://github.com/home-lang/pantry/commit/0f46a88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d1d4d25](https://github.com/home-lang/pantry/commit/d1d4d25)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([771e328](https://github.com/home-lang/pantry/commit/771e328)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([13739a7](https://github.com/home-lang/pantry/commit/13739a7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1b831b2](https://github.com/home-lang/pantry/commit/1b831b2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0cd3ae1](https://github.com/home-lang/pantry/commit/0cd3ae1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6939992](https://github.com/home-lang/pantry/commit/6939992)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([07031b6](https://github.com/home-lang/pantry/commit/07031b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0d9aaa](https://github.com/home-lang/pantry/commit/f0d9aaa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4692d44](https://github.com/home-lang/pantry/commit/4692d44)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5ed8f7a](https://github.com/home-lang/pantry/commit/5ed8f7a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6e66d7d](https://github.com/home-lang/pantry/commit/6e66d7d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8f0c3f8](https://github.com/home-lang/pantry/commit/8f0c3f8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6335171](https://github.com/home-lang/pantry/commit/6335171)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e17c2fd](https://github.com/home-lang/pantry/commit/e17c2fd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([139058a](https://github.com/home-lang/pantry/commit/139058a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5611227](https://github.com/home-lang/pantry/commit/5611227)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([70df5eb](https://github.com/home-lang/pantry/commit/70df5eb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b3a30fe](https://github.com/home-lang/pantry/commit/b3a30fe)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0bc1242](https://github.com/home-lang/pantry/commit/0bc1242)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fa7f3f6](https://github.com/home-lang/pantry/commit/fa7f3f6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d56b162](https://github.com/home-lang/pantry/commit/d56b162)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1bf190f](https://github.com/home-lang/pantry/commit/1bf190f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([579cf81](https://github.com/home-lang/pantry/commit/579cf81)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([881e629](https://github.com/home-lang/pantry/commit/881e629)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2cb2603](https://github.com/home-lang/pantry/commit/2cb2603)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([badc05b](https://github.com/home-lang/pantry/commit/badc05b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([18b1ab5](https://github.com/home-lang/pantry/commit/18b1ab5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4befa2a](https://github.com/home-lang/pantry/commit/4befa2a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0c42f1d](https://github.com/home-lang/pantry/commit/0c42f1d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4ec64e9](https://github.com/home-lang/pantry/commit/4ec64e9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4c1de1c](https://github.com/home-lang/pantry/commit/4c1de1c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d332084](https://github.com/home-lang/pantry/commit/d332084)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c86506a](https://github.com/home-lang/pantry/commit/c86506a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b9f277b](https://github.com/home-lang/pantry/commit/b9f277b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b974496](https://github.com/home-lang/pantry/commit/b974496)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([071cbad](https://github.com/home-lang/pantry/commit/071cbad)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([64bff24](https://github.com/home-lang/pantry/commit/64bff24)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([04b34de](https://github.com/home-lang/pantry/commit/04b34de)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d37014b](https://github.com/home-lang/pantry/commit/d37014b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([333ee27](https://github.com/home-lang/pantry/commit/333ee27)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c988874](https://github.com/home-lang/pantry/commit/c988874)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d77c526](https://github.com/home-lang/pantry/commit/d77c526)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([552b24e](https://github.com/home-lang/pantry/commit/552b24e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([58ccb50](https://github.com/home-lang/pantry/commit/58ccb50)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cf1f96b](https://github.com/home-lang/pantry/commit/cf1f96b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([20bb789](https://github.com/home-lang/pantry/commit/20bb789)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8386d7c](https://github.com/home-lang/pantry/commit/8386d7c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3a64c1b](https://github.com/home-lang/pantry/commit/3a64c1b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a9d0ebc](https://github.com/home-lang/pantry/commit/a9d0ebc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0907080](https://github.com/home-lang/pantry/commit/0907080)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5be397d](https://github.com/home-lang/pantry/commit/5be397d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b8684f2](https://github.com/home-lang/pantry/commit/b8684f2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c75c02f](https://github.com/home-lang/pantry/commit/c75c02f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bbdd28b](https://github.com/home-lang/pantry/commit/bbdd28b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c0a5358](https://github.com/home-lang/pantry/commit/c0a5358)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2067abd](https://github.com/home-lang/pantry/commit/2067abd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([80c02f8](https://github.com/home-lang/pantry/commit/80c02f8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4626bc7](https://github.com/home-lang/pantry/commit/4626bc7)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([12296b4](https://github.com/home-lang/pantry/commit/12296b4)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([9bbf5a5](https://github.com/home-lang/pantry/commit/9bbf5a5)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([da87f3a](https://github.com/home-lang/pantry/commit/da87f3a)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([ef3e5b1](https://github.com/home-lang/pantry/commit/ef3e5b1)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([aacc3fa](https://github.com/home-lang/pantry/commit/aacc3fa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e98ce80](https://github.com/home-lang/pantry/commit/e98ce80)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4caee27](https://github.com/home-lang/pantry/commit/4caee27)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f5be4b4](https://github.com/home-lang/pantry/commit/f5be4b4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([77e92f9](https://github.com/home-lang/pantry/commit/77e92f9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9856e50](https://github.com/home-lang/pantry/commit/9856e50)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2490f0f](https://github.com/home-lang/pantry/commit/2490f0f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e00a816](https://github.com/home-lang/pantry/commit/e00a816)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0ddb6a](https://github.com/home-lang/pantry/commit/f0ddb6a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e7a2d81](https://github.com/home-lang/pantry/commit/e7a2d81)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b44f668](https://github.com/home-lang/pantry/commit/b44f668)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([66a0ee9](https://github.com/home-lang/pantry/commit/66a0ee9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1762256](https://github.com/home-lang/pantry/commit/1762256)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f3aedcd](https://github.com/home-lang/pantry/commit/f3aedcd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([05d5e60](https://github.com/home-lang/pantry/commit/05d5e60)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b99f195](https://github.com/home-lang/pantry/commit/b99f195)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ee4e947](https://github.com/home-lang/pantry/commit/ee4e947)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d6114bc](https://github.com/home-lang/pantry/commit/d6114bc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9508751](https://github.com/home-lang/pantry/commit/9508751)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3f1ba8d](https://github.com/home-lang/pantry/commit/3f1ba8d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eae7f34](https://github.com/home-lang/pantry/commit/eae7f34)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e0d251a](https://github.com/home-lang/pantry/commit/e0d251a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f7ef652](https://github.com/home-lang/pantry/commit/f7ef652)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([03b9c29](https://github.com/home-lang/pantry/commit/03b9c29)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([60dc5ee](https://github.com/home-lang/pantry/commit/60dc5ee)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a10decf](https://github.com/home-lang/pantry/commit/a10decf)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b338ced](https://github.com/home-lang/pantry/commit/b338ced)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fb14b59](https://github.com/home-lang/pantry/commit/fb14b59)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d9a7d2d](https://github.com/home-lang/pantry/commit/d9a7d2d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([df99193](https://github.com/home-lang/pantry/commit/df99193)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d9abd59](https://github.com/home-lang/pantry/commit/d9abd59)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d588ebc](https://github.com/home-lang/pantry/commit/d588ebc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9f823c1](https://github.com/home-lang/pantry/commit/9f823c1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cf61c96](https://github.com/home-lang/pantry/commit/cf61c96)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0af1e14](https://github.com/home-lang/pantry/commit/0af1e14)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2455159](https://github.com/home-lang/pantry/commit/2455159)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a949c53](https://github.com/home-lang/pantry/commit/a949c53)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([00a1d8c](https://github.com/home-lang/pantry/commit/00a1d8c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c022676](https://github.com/home-lang/pantry/commit/c022676)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([11aab6e](https://github.com/home-lang/pantry/commit/11aab6e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e572aba](https://github.com/home-lang/pantry/commit/e572aba)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f2ed9a4](https://github.com/home-lang/pantry/commit/f2ed9a4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([12583ca](https://github.com/home-lang/pantry/commit/12583ca)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d0f4d9](https://github.com/home-lang/pantry/commit/1d0f4d9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e8cb2fb](https://github.com/home-lang/pantry/commit/e8cb2fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([145f908](https://github.com/home-lang/pantry/commit/145f908)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([51566dd](https://github.com/home-lang/pantry/commit/51566dd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e613ce1](https://github.com/home-lang/pantry/commit/e613ce1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7fe322e](https://github.com/home-lang/pantry/commit/7fe322e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([48d278c](https://github.com/home-lang/pantry/commit/48d278c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2de3b88](https://github.com/home-lang/pantry/commit/2de3b88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1a51d1b](https://github.com/home-lang/pantry/commit/1a51d1b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([19be332](https://github.com/home-lang/pantry/commit/19be332)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8973d73](https://github.com/home-lang/pantry/commit/8973d73)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([facbeea](https://github.com/home-lang/pantry/commit/facbeea)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([985e671](https://github.com/home-lang/pantry/commit/985e671)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ce7221d](https://github.com/home-lang/pantry/commit/ce7221d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([241e943](https://github.com/home-lang/pantry/commit/241e943)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d6db31](https://github.com/home-lang/pantry/commit/1d6db31)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bdff3a5](https://github.com/home-lang/pantry/commit/bdff3a5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dcf90c8](https://github.com/home-lang/pantry/commit/dcf90c8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f1412db](https://github.com/home-lang/pantry/commit/f1412db)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eecb671](https://github.com/home-lang/pantry/commit/eecb671)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3d4bd79](https://github.com/home-lang/pantry/commit/3d4bd79)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([14c04c7](https://github.com/home-lang/pantry/commit/14c04c7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3ccbf93](https://github.com/home-lang/pantry/commit/3ccbf93)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0758d58](https://github.com/home-lang/pantry/commit/0758d58)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dceaba0](https://github.com/home-lang/pantry/commit/dceaba0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([69b707c](https://github.com/home-lang/pantry/commit/69b707c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ae10ac2](https://github.com/home-lang/pantry/commit/ae10ac2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([88eda8b](https://github.com/home-lang/pantry/commit/88eda8b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eae1971](https://github.com/home-lang/pantry/commit/eae1971)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f3f5bb3](https://github.com/home-lang/pantry/commit/f3f5bb3)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0898c3b](https://github.com/home-lang/pantry/commit/0898c3b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([444a63a](https://github.com/home-lang/pantry/commit/444a63a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e9d896d](https://github.com/home-lang/pantry/commit/e9d896d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0fed2d9](https://github.com/home-lang/pantry/commit/0fed2d9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([74b8561](https://github.com/home-lang/pantry/commit/74b8561)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([62f8f20](https://github.com/home-lang/pantry/commit/62f8f20)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b506eb2](https://github.com/home-lang/pantry/commit/b506eb2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1a6fc6d](https://github.com/home-lang/pantry/commit/1a6fc6d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([67fce92](https://github.com/home-lang/pantry/commit/67fce92)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([13da29f](https://github.com/home-lang/pantry/commit/13da29f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8329dce](https://github.com/home-lang/pantry/commit/8329dce)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([79d00fb](https://github.com/home-lang/pantry/commit/79d00fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0de567](https://github.com/home-lang/pantry/commit/f0de567)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d732c72](https://github.com/home-lang/pantry/commit/d732c72)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([12e3399](https://github.com/home-lang/pantry/commit/12e3399)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a3062d6](https://github.com/home-lang/pantry/commit/a3062d6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b1e3401](https://github.com/home-lang/pantry/commit/b1e3401)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2450f1e](https://github.com/home-lang/pantry/commit/2450f1e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7303b40](https://github.com/home-lang/pantry/commit/7303b40)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([24fe7e6](https://github.com/home-lang/pantry/commit/24fe7e6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b3392bc](https://github.com/home-lang/pantry/commit/b3392bc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0eed87d](https://github.com/home-lang/pantry/commit/0eed87d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1a0bdc1](https://github.com/home-lang/pantry/commit/1a0bdc1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7de1f76](https://github.com/home-lang/pantry/commit/7de1f76)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5c924e4](https://github.com/home-lang/pantry/commit/5c924e4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d84ebad](https://github.com/home-lang/pantry/commit/d84ebad)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e7ae3d6](https://github.com/home-lang/pantry/commit/e7ae3d6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d372ac6](https://github.com/home-lang/pantry/commit/d372ac6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([45bc58a](https://github.com/home-lang/pantry/commit/45bc58a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3a70d34](https://github.com/home-lang/pantry/commit/3a70d34)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e4e9238](https://github.com/home-lang/pantry/commit/e4e9238)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([20cd273](https://github.com/home-lang/pantry/commit/20cd273)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2353992](https://github.com/home-lang/pantry/commit/2353992)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f5b1eed](https://github.com/home-lang/pantry/commit/f5b1eed)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d83c3a2](https://github.com/home-lang/pantry/commit/d83c3a2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bfcfe25](https://github.com/home-lang/pantry/commit/bfcfe25)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e4e0162](https://github.com/home-lang/pantry/commit/e4e0162)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([050fa3d](https://github.com/home-lang/pantry/commit/050fa3d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2948663](https://github.com/home-lang/pantry/commit/2948663)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9bec7a0](https://github.com/home-lang/pantry/commit/9bec7a0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([27b1b3c](https://github.com/home-lang/pantry/commit/27b1b3c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ad62d37](https://github.com/home-lang/pantry/commit/ad62d37)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2ec2dd0](https://github.com/home-lang/pantry/commit/2ec2dd0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8070547](https://github.com/home-lang/pantry/commit/8070547)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a6501ab](https://github.com/home-lang/pantry/commit/a6501ab)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d0fe70e](https://github.com/home-lang/pantry/commit/d0fe70e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b688dd2](https://github.com/home-lang/pantry/commit/b688dd2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2e86308](https://github.com/home-lang/pantry/commit/2e86308)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8f089ef](https://github.com/home-lang/pantry/commit/8f089ef)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cdcac8e](https://github.com/home-lang/pantry/commit/cdcac8e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3cb695c](https://github.com/home-lang/pantry/commit/3cb695c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3ac7c95](https://github.com/home-lang/pantry/commit/3ac7c95)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([31b68fb](https://github.com/home-lang/pantry/commit/31b68fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([aaff5c5](https://github.com/home-lang/pantry/commit/aaff5c5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8e98a73](https://github.com/home-lang/pantry/commit/8e98a73)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([32b8a1b](https://github.com/home-lang/pantry/commit/32b8a1b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9ea9545](https://github.com/home-lang/pantry/commit/9ea9545)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e079e93](https://github.com/home-lang/pantry/commit/e079e93)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([228c9be](https://github.com/home-lang/pantry/commit/228c9be)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a4d111f](https://github.com/home-lang/pantry/commit/a4d111f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5339785](https://github.com/home-lang/pantry/commit/5339785)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([66e56dc](https://github.com/home-lang/pantry/commit/66e56dc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4133bd9](https://github.com/home-lang/pantry/commit/4133bd9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9d9dfd3](https://github.com/home-lang/pantry/commit/9d9dfd3)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d49589b](https://github.com/home-lang/pantry/commit/d49589b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([319e024](https://github.com/home-lang/pantry/commit/319e024)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([93ed769](https://github.com/home-lang/pantry/commit/93ed769)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8179bf5](https://github.com/home-lang/pantry/commit/8179bf5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2dd18c4](https://github.com/home-lang/pantry/commit/2dd18c4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b7f66ee](https://github.com/home-lang/pantry/commit/b7f66ee)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([120abc9](https://github.com/home-lang/pantry/commit/120abc9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0fa01ae](https://github.com/home-lang/pantry/commit/0fa01ae)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([03c3526](https://github.com/home-lang/pantry/commit/03c3526)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([91584cb](https://github.com/home-lang/pantry/commit/91584cb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([21b341c](https://github.com/home-lang/pantry/commit/21b341c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d045f65](https://github.com/home-lang/pantry/commit/d045f65)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([34bb462](https://github.com/home-lang/pantry/commit/34bb462)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([04f9a6f](https://github.com/home-lang/pantry/commit/04f9a6f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0af924](https://github.com/home-lang/pantry/commit/f0af924)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1a0ed0d](https://github.com/home-lang/pantry/commit/1a0ed0d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9538be4](https://github.com/home-lang/pantry/commit/9538be4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([666f49b](https://github.com/home-lang/pantry/commit/666f49b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fbbfd1c](https://github.com/home-lang/pantry/commit/fbbfd1c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c84ba14](https://github.com/home-lang/pantry/commit/c84ba14)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f3b3420](https://github.com/home-lang/pantry/commit/f3b3420)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a7344e3](https://github.com/home-lang/pantry/commit/a7344e3)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([beea480](https://github.com/home-lang/pantry/commit/beea480)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([19e0365](https://github.com/home-lang/pantry/commit/19e0365)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([934b259](https://github.com/home-lang/pantry/commit/934b259)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8029a93](https://github.com/home-lang/pantry/commit/8029a93)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2f3edeb](https://github.com/home-lang/pantry/commit/2f3edeb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5779e05](https://github.com/home-lang/pantry/commit/5779e05)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([863b8b1](https://github.com/home-lang/pantry/commit/863b8b1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5b23b1c](https://github.com/home-lang/pantry/commit/5b23b1c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ca33f0a](https://github.com/home-lang/pantry/commit/ca33f0a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5d28bf9](https://github.com/home-lang/pantry/commit/5d28bf9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([aec8043](https://github.com/home-lang/pantry/commit/aec8043)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fd0986a](https://github.com/home-lang/pantry/commit/fd0986a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([52c88ae](https://github.com/home-lang/pantry/commit/52c88ae)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0f21410](https://github.com/home-lang/pantry/commit/0f21410)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3673912](https://github.com/home-lang/pantry/commit/3673912)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f408666](https://github.com/home-lang/pantry/commit/f408666)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d4db435](https://github.com/home-lang/pantry/commit/d4db435)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0788b17](https://github.com/home-lang/pantry/commit/0788b17)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([08f9be2](https://github.com/home-lang/pantry/commit/08f9be2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([00e1abc](https://github.com/home-lang/pantry/commit/00e1abc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9857315](https://github.com/home-lang/pantry/commit/9857315)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4d98f7c](https://github.com/home-lang/pantry/commit/4d98f7c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c9e05f0](https://github.com/home-lang/pantry/commit/c9e05f0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c3addd9](https://github.com/home-lang/pantry/commit/c3addd9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ec61590](https://github.com/home-lang/pantry/commit/ec61590)) _(by Chris <chrisbreuer93@gmail.com>)_
- update deps ([e6d8df5](https://github.com/home-lang/pantry/commit/e6d8df5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1819f76](https://github.com/home-lang/pantry/commit/1819f76)) _(by Chris <chrisbreuer93@gmail.com>)_
- update tooling ([c8bae76](https://github.com/home-lang/pantry/commit/c8bae76)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([f6d35db](https://github.com/home-lang/pantry/commit/f6d35db)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2f7f895](https://github.com/home-lang/pantry/commit/2f7f895)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6069578](https://github.com/home-lang/pantry/commit/6069578)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3eb8cbd](https://github.com/home-lang/pantry/commit/3eb8cbd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1017e9f](https://github.com/home-lang/pantry/commit/1017e9f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c1e34c5](https://github.com/home-lang/pantry/commit/c1e34c5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8a0be92](https://github.com/home-lang/pantry/commit/8a0be92)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([89818e1](https://github.com/home-lang/pantry/commit/89818e1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c812bf5](https://github.com/home-lang/pantry/commit/c812bf5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7af95c5](https://github.com/home-lang/pantry/commit/7af95c5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6737ef7](https://github.com/home-lang/pantry/commit/6737ef7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f28e845](https://github.com/home-lang/pantry/commit/f28e845)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d571f47](https://github.com/home-lang/pantry/commit/d571f47)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a6941d2](https://github.com/home-lang/pantry/commit/a6941d2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([aff6cc1](https://github.com/home-lang/pantry/commit/aff6cc1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ecfd2e0](https://github.com/home-lang/pantry/commit/ecfd2e0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9d697c7](https://github.com/home-lang/pantry/commit/9d697c7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e3b3a40](https://github.com/home-lang/pantry/commit/e3b3a40)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([aa2f1f7](https://github.com/home-lang/pantry/commit/aa2f1f7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5c13d45](https://github.com/home-lang/pantry/commit/5c13d45)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c2377f4](https://github.com/home-lang/pantry/commit/c2377f4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([95e2d58](https://github.com/home-lang/pantry/commit/95e2d58)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([346f968](https://github.com/home-lang/pantry/commit/346f968)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0b00a5c](https://github.com/home-lang/pantry/commit/0b00a5c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7178398](https://github.com/home-lang/pantry/commit/7178398)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0a44bd6](https://github.com/home-lang/pantry/commit/0a44bd6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bea3c67](https://github.com/home-lang/pantry/commit/bea3c67)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([92ba206](https://github.com/home-lang/pantry/commit/92ba206)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e0da65c](https://github.com/home-lang/pantry/commit/e0da65c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f38c897](https://github.com/home-lang/pantry/commit/f38c897)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([15d8f5b](https://github.com/home-lang/pantry/commit/15d8f5b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b691b26](https://github.com/home-lang/pantry/commit/b691b26)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4a48a92](https://github.com/home-lang/pantry/commit/4a48a92)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5a2faca](https://github.com/home-lang/pantry/commit/5a2faca)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([98d4605](https://github.com/home-lang/pantry/commit/98d4605)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1bc31a3](https://github.com/home-lang/pantry/commit/1bc31a3)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6b11007](https://github.com/home-lang/pantry/commit/6b11007)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([66f607e](https://github.com/home-lang/pantry/commit/66f607e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0a1a58a](https://github.com/home-lang/pantry/commit/0a1a58a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([efdc71d](https://github.com/home-lang/pantry/commit/efdc71d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ebb135a](https://github.com/home-lang/pantry/commit/ebb135a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0f3c7d5](https://github.com/home-lang/pantry/commit/0f3c7d5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([99ec068](https://github.com/home-lang/pantry/commit/99ec068)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ac3b481](https://github.com/home-lang/pantry/commit/ac3b481)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d195819](https://github.com/home-lang/pantry/commit/d195819)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e1e3fde](https://github.com/home-lang/pantry/commit/e1e3fde)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fd12b8e](https://github.com/home-lang/pantry/commit/fd12b8e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cb00f69](https://github.com/home-lang/pantry/commit/cb00f69)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7d51b79](https://github.com/home-lang/pantry/commit/7d51b79)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8bc02bc](https://github.com/home-lang/pantry/commit/8bc02bc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([05021ca](https://github.com/home-lang/pantry/commit/05021ca)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8b5597f](https://github.com/home-lang/pantry/commit/8b5597f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9832ff0](https://github.com/home-lang/pantry/commit/9832ff0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5658e5b](https://github.com/home-lang/pantry/commit/5658e5b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5298bb7](https://github.com/home-lang/pantry/commit/5298bb7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6ef193f](https://github.com/home-lang/pantry/commit/6ef193f)) _(by Chris <chrisbreuer93@gmail.com>)_

### 📄 Miscellaneous

- Fix Linux PHP builds: resolve precompiler failures and enhance fallback build ([138f9a3](https://github.com/home-lang/pantry/commit/138f9a3)) _(by Chris <chrisbreuer93@gmail.com>)_
- Fix Windows PHP builds: enhance pre-compiled binaries with comprehensive extension support ([1c4d257](https://github.com/home-lang/pantry/commit/1c4d257)) _(by Chris <chrisbreuer93@gmail.com>)_
- Fix macOS DNS resolver linking issue in PHP build ([ca6661c](https://github.com/home-lang/pantry/commit/ca6661c)) _(by Chris <chrisbreuer93@gmail.com>)_
- Fix macOS PHP precompiler dependency path resolution ([83b0d48](https://github.com/home-lang/pantry/commit/83b0d48)) _(by Chris <chrisbreuer93@gmail.com>)_
- Fix Windows PHP extension detection logic ([f23cb94](https://github.com/home-lang/pantry/commit/f23cb94)) _(by Chris <chrisbreuer93@gmail.com>)_
- chore: wip ([fa66533](https://github.com/home-lang/pantry/commit/fa66533)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Adelino Ngomacha <adelinob335@gmail.com>_
- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/binaries-234...HEAD)

### 🧹 Chores

- wip ([37419e2](https://github.com/home-lang/pantry/commit/37419e2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7a8b56e](https://github.com/home-lang/pantry/commit/7a8b56e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7cdbb29](https://github.com/home-lang/pantry/commit/7cdbb29)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([71ebb88](https://github.com/home-lang/pantry/commit/71ebb88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5d61b6a](https://github.com/home-lang/pantry/commit/5d61b6a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([909bfe0](https://github.com/home-lang/pantry/commit/909bfe0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3de09a4](https://github.com/home-lang/pantry/commit/3de09a4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bce9611](https://github.com/home-lang/pantry/commit/bce9611)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c751514](https://github.com/home-lang/pantry/commit/c751514)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c7ceb66](https://github.com/home-lang/pantry/commit/c7ceb66)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a5cd20c](https://github.com/home-lang/pantry/commit/a5cd20c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c21924c](https://github.com/home-lang/pantry/commit/c21924c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9a9b17b](https://github.com/home-lang/pantry/commit/9a9b17b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([abce88a](https://github.com/home-lang/pantry/commit/abce88a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([89ceec0](https://github.com/home-lang/pantry/commit/89ceec0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1292afc](https://github.com/home-lang/pantry/commit/1292afc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7c98087](https://github.com/home-lang/pantry/commit/7c98087)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3ccd81a](https://github.com/home-lang/pantry/commit/3ccd81a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cac2daa](https://github.com/home-lang/pantry/commit/cac2daa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7321143](https://github.com/home-lang/pantry/commit/7321143)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([285851e](https://github.com/home-lang/pantry/commit/285851e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d8155a](https://github.com/home-lang/pantry/commit/1d8155a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dc3e607](https://github.com/home-lang/pantry/commit/dc3e607)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c908887](https://github.com/home-lang/pantry/commit/c908887)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([06b8a95](https://github.com/home-lang/pantry/commit/06b8a95)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([61bcb3a](https://github.com/home-lang/pantry/commit/61bcb3a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([11225ec](https://github.com/home-lang/pantry/commit/11225ec)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([804b146](https://github.com/home-lang/pantry/commit/804b146)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7858565](https://github.com/home-lang/pantry/commit/7858565)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a037ea6](https://github.com/home-lang/pantry/commit/a037ea6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f7b8894](https://github.com/home-lang/pantry/commit/f7b8894)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a42ca1f](https://github.com/home-lang/pantry/commit/a42ca1f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d0189b6](https://github.com/home-lang/pantry/commit/d0189b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([87ab9ce](https://github.com/home-lang/pantry/commit/87ab9ce)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([01fa7ea](https://github.com/home-lang/pantry/commit/01fa7ea)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ce4f45f](https://github.com/home-lang/pantry/commit/ce4f45f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([94a846c](https://github.com/home-lang/pantry/commit/94a846c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([75a5511](https://github.com/home-lang/pantry/commit/75a5511)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([61917b5](https://github.com/home-lang/pantry/commit/61917b5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0f46a88](https://github.com/home-lang/pantry/commit/0f46a88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d1d4d25](https://github.com/home-lang/pantry/commit/d1d4d25)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([771e328](https://github.com/home-lang/pantry/commit/771e328)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([13739a7](https://github.com/home-lang/pantry/commit/13739a7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1b831b2](https://github.com/home-lang/pantry/commit/1b831b2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0cd3ae1](https://github.com/home-lang/pantry/commit/0cd3ae1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6939992](https://github.com/home-lang/pantry/commit/6939992)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([07031b6](https://github.com/home-lang/pantry/commit/07031b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0d9aaa](https://github.com/home-lang/pantry/commit/f0d9aaa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4692d44](https://github.com/home-lang/pantry/commit/4692d44)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5ed8f7a](https://github.com/home-lang/pantry/commit/5ed8f7a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6e66d7d](https://github.com/home-lang/pantry/commit/6e66d7d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8f0c3f8](https://github.com/home-lang/pantry/commit/8f0c3f8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6335171](https://github.com/home-lang/pantry/commit/6335171)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e17c2fd](https://github.com/home-lang/pantry/commit/e17c2fd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([139058a](https://github.com/home-lang/pantry/commit/139058a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5611227](https://github.com/home-lang/pantry/commit/5611227)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([70df5eb](https://github.com/home-lang/pantry/commit/70df5eb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b3a30fe](https://github.com/home-lang/pantry/commit/b3a30fe)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0bc1242](https://github.com/home-lang/pantry/commit/0bc1242)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fa7f3f6](https://github.com/home-lang/pantry/commit/fa7f3f6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d56b162](https://github.com/home-lang/pantry/commit/d56b162)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1bf190f](https://github.com/home-lang/pantry/commit/1bf190f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([579cf81](https://github.com/home-lang/pantry/commit/579cf81)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([881e629](https://github.com/home-lang/pantry/commit/881e629)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2cb2603](https://github.com/home-lang/pantry/commit/2cb2603)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([badc05b](https://github.com/home-lang/pantry/commit/badc05b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([18b1ab5](https://github.com/home-lang/pantry/commit/18b1ab5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4befa2a](https://github.com/home-lang/pantry/commit/4befa2a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0c42f1d](https://github.com/home-lang/pantry/commit/0c42f1d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4ec64e9](https://github.com/home-lang/pantry/commit/4ec64e9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4c1de1c](https://github.com/home-lang/pantry/commit/4c1de1c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d332084](https://github.com/home-lang/pantry/commit/d332084)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c86506a](https://github.com/home-lang/pantry/commit/c86506a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b9f277b](https://github.com/home-lang/pantry/commit/b9f277b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b974496](https://github.com/home-lang/pantry/commit/b974496)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([071cbad](https://github.com/home-lang/pantry/commit/071cbad)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([64bff24](https://github.com/home-lang/pantry/commit/64bff24)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([04b34de](https://github.com/home-lang/pantry/commit/04b34de)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d37014b](https://github.com/home-lang/pantry/commit/d37014b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([333ee27](https://github.com/home-lang/pantry/commit/333ee27)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c988874](https://github.com/home-lang/pantry/commit/c988874)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d77c526](https://github.com/home-lang/pantry/commit/d77c526)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([552b24e](https://github.com/home-lang/pantry/commit/552b24e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([58ccb50](https://github.com/home-lang/pantry/commit/58ccb50)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cf1f96b](https://github.com/home-lang/pantry/commit/cf1f96b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([20bb789](https://github.com/home-lang/pantry/commit/20bb789)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8386d7c](https://github.com/home-lang/pantry/commit/8386d7c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3a64c1b](https://github.com/home-lang/pantry/commit/3a64c1b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a9d0ebc](https://github.com/home-lang/pantry/commit/a9d0ebc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0907080](https://github.com/home-lang/pantry/commit/0907080)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5be397d](https://github.com/home-lang/pantry/commit/5be397d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b8684f2](https://github.com/home-lang/pantry/commit/b8684f2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c75c02f](https://github.com/home-lang/pantry/commit/c75c02f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bbdd28b](https://github.com/home-lang/pantry/commit/bbdd28b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c0a5358](https://github.com/home-lang/pantry/commit/c0a5358)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2067abd](https://github.com/home-lang/pantry/commit/2067abd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([80c02f8](https://github.com/home-lang/pantry/commit/80c02f8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4626bc7](https://github.com/home-lang/pantry/commit/4626bc7)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([12296b4](https://github.com/home-lang/pantry/commit/12296b4)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([9bbf5a5](https://github.com/home-lang/pantry/commit/9bbf5a5)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([da87f3a](https://github.com/home-lang/pantry/commit/da87f3a)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([ef3e5b1](https://github.com/home-lang/pantry/commit/ef3e5b1)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([aacc3fa](https://github.com/home-lang/pantry/commit/aacc3fa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e98ce80](https://github.com/home-lang/pantry/commit/e98ce80)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4caee27](https://github.com/home-lang/pantry/commit/4caee27)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f5be4b4](https://github.com/home-lang/pantry/commit/f5be4b4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([77e92f9](https://github.com/home-lang/pantry/commit/77e92f9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9856e50](https://github.com/home-lang/pantry/commit/9856e50)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2490f0f](https://github.com/home-lang/pantry/commit/2490f0f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e00a816](https://github.com/home-lang/pantry/commit/e00a816)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0ddb6a](https://github.com/home-lang/pantry/commit/f0ddb6a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e7a2d81](https://github.com/home-lang/pantry/commit/e7a2d81)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b44f668](https://github.com/home-lang/pantry/commit/b44f668)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([66a0ee9](https://github.com/home-lang/pantry/commit/66a0ee9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1762256](https://github.com/home-lang/pantry/commit/1762256)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f3aedcd](https://github.com/home-lang/pantry/commit/f3aedcd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([05d5e60](https://github.com/home-lang/pantry/commit/05d5e60)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b99f195](https://github.com/home-lang/pantry/commit/b99f195)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ee4e947](https://github.com/home-lang/pantry/commit/ee4e947)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d6114bc](https://github.com/home-lang/pantry/commit/d6114bc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9508751](https://github.com/home-lang/pantry/commit/9508751)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3f1ba8d](https://github.com/home-lang/pantry/commit/3f1ba8d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eae7f34](https://github.com/home-lang/pantry/commit/eae7f34)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e0d251a](https://github.com/home-lang/pantry/commit/e0d251a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f7ef652](https://github.com/home-lang/pantry/commit/f7ef652)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([03b9c29](https://github.com/home-lang/pantry/commit/03b9c29)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([60dc5ee](https://github.com/home-lang/pantry/commit/60dc5ee)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a10decf](https://github.com/home-lang/pantry/commit/a10decf)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b338ced](https://github.com/home-lang/pantry/commit/b338ced)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fb14b59](https://github.com/home-lang/pantry/commit/fb14b59)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d9a7d2d](https://github.com/home-lang/pantry/commit/d9a7d2d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([df99193](https://github.com/home-lang/pantry/commit/df99193)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d9abd59](https://github.com/home-lang/pantry/commit/d9abd59)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d588ebc](https://github.com/home-lang/pantry/commit/d588ebc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9f823c1](https://github.com/home-lang/pantry/commit/9f823c1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cf61c96](https://github.com/home-lang/pantry/commit/cf61c96)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0af1e14](https://github.com/home-lang/pantry/commit/0af1e14)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2455159](https://github.com/home-lang/pantry/commit/2455159)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a949c53](https://github.com/home-lang/pantry/commit/a949c53)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([00a1d8c](https://github.com/home-lang/pantry/commit/00a1d8c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c022676](https://github.com/home-lang/pantry/commit/c022676)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([11aab6e](https://github.com/home-lang/pantry/commit/11aab6e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e572aba](https://github.com/home-lang/pantry/commit/e572aba)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f2ed9a4](https://github.com/home-lang/pantry/commit/f2ed9a4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([12583ca](https://github.com/home-lang/pantry/commit/12583ca)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d0f4d9](https://github.com/home-lang/pantry/commit/1d0f4d9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e8cb2fb](https://github.com/home-lang/pantry/commit/e8cb2fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([145f908](https://github.com/home-lang/pantry/commit/145f908)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([51566dd](https://github.com/home-lang/pantry/commit/51566dd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e613ce1](https://github.com/home-lang/pantry/commit/e613ce1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7fe322e](https://github.com/home-lang/pantry/commit/7fe322e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([48d278c](https://github.com/home-lang/pantry/commit/48d278c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2de3b88](https://github.com/home-lang/pantry/commit/2de3b88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1a51d1b](https://github.com/home-lang/pantry/commit/1a51d1b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([19be332](https://github.com/home-lang/pantry/commit/19be332)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8973d73](https://github.com/home-lang/pantry/commit/8973d73)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([facbeea](https://github.com/home-lang/pantry/commit/facbeea)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([985e671](https://github.com/home-lang/pantry/commit/985e671)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ce7221d](https://github.com/home-lang/pantry/commit/ce7221d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([241e943](https://github.com/home-lang/pantry/commit/241e943)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d6db31](https://github.com/home-lang/pantry/commit/1d6db31)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bdff3a5](https://github.com/home-lang/pantry/commit/bdff3a5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dcf90c8](https://github.com/home-lang/pantry/commit/dcf90c8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f1412db](https://github.com/home-lang/pantry/commit/f1412db)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eecb671](https://github.com/home-lang/pantry/commit/eecb671)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3d4bd79](https://github.com/home-lang/pantry/commit/3d4bd79)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([14c04c7](https://github.com/home-lang/pantry/commit/14c04c7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3ccbf93](https://github.com/home-lang/pantry/commit/3ccbf93)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0758d58](https://github.com/home-lang/pantry/commit/0758d58)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dceaba0](https://github.com/home-lang/pantry/commit/dceaba0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([69b707c](https://github.com/home-lang/pantry/commit/69b707c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ae10ac2](https://github.com/home-lang/pantry/commit/ae10ac2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([88eda8b](https://github.com/home-lang/pantry/commit/88eda8b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eae1971](https://github.com/home-lang/pantry/commit/eae1971)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f3f5bb3](https://github.com/home-lang/pantry/commit/f3f5bb3)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0898c3b](https://github.com/home-lang/pantry/commit/0898c3b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([444a63a](https://github.com/home-lang/pantry/commit/444a63a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e9d896d](https://github.com/home-lang/pantry/commit/e9d896d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0fed2d9](https://github.com/home-lang/pantry/commit/0fed2d9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([74b8561](https://github.com/home-lang/pantry/commit/74b8561)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([62f8f20](https://github.com/home-lang/pantry/commit/62f8f20)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b506eb2](https://github.com/home-lang/pantry/commit/b506eb2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1a6fc6d](https://github.com/home-lang/pantry/commit/1a6fc6d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([67fce92](https://github.com/home-lang/pantry/commit/67fce92)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([13da29f](https://github.com/home-lang/pantry/commit/13da29f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8329dce](https://github.com/home-lang/pantry/commit/8329dce)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([79d00fb](https://github.com/home-lang/pantry/commit/79d00fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0de567](https://github.com/home-lang/pantry/commit/f0de567)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d732c72](https://github.com/home-lang/pantry/commit/d732c72)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Adelino Ngomacha <adelinob335@gmail.com>_
- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/home-lang/pantry/compare/binaries-234...HEAD)

### 🧹 Chores

- wip ([37419e2](https://github.com/home-lang/pantry/commit/37419e2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7a8b56e](https://github.com/home-lang/pantry/commit/7a8b56e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7cdbb29](https://github.com/home-lang/pantry/commit/7cdbb29)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([71ebb88](https://github.com/home-lang/pantry/commit/71ebb88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5d61b6a](https://github.com/home-lang/pantry/commit/5d61b6a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([909bfe0](https://github.com/home-lang/pantry/commit/909bfe0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3de09a4](https://github.com/home-lang/pantry/commit/3de09a4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bce9611](https://github.com/home-lang/pantry/commit/bce9611)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c751514](https://github.com/home-lang/pantry/commit/c751514)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c7ceb66](https://github.com/home-lang/pantry/commit/c7ceb66)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a5cd20c](https://github.com/home-lang/pantry/commit/a5cd20c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c21924c](https://github.com/home-lang/pantry/commit/c21924c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9a9b17b](https://github.com/home-lang/pantry/commit/9a9b17b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([abce88a](https://github.com/home-lang/pantry/commit/abce88a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([89ceec0](https://github.com/home-lang/pantry/commit/89ceec0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1292afc](https://github.com/home-lang/pantry/commit/1292afc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7c98087](https://github.com/home-lang/pantry/commit/7c98087)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3ccd81a](https://github.com/home-lang/pantry/commit/3ccd81a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cac2daa](https://github.com/home-lang/pantry/commit/cac2daa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7321143](https://github.com/home-lang/pantry/commit/7321143)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([285851e](https://github.com/home-lang/pantry/commit/285851e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d8155a](https://github.com/home-lang/pantry/commit/1d8155a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dc3e607](https://github.com/home-lang/pantry/commit/dc3e607)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c908887](https://github.com/home-lang/pantry/commit/c908887)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([06b8a95](https://github.com/home-lang/pantry/commit/06b8a95)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([61bcb3a](https://github.com/home-lang/pantry/commit/61bcb3a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([11225ec](https://github.com/home-lang/pantry/commit/11225ec)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([804b146](https://github.com/home-lang/pantry/commit/804b146)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7858565](https://github.com/home-lang/pantry/commit/7858565)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a037ea6](https://github.com/home-lang/pantry/commit/a037ea6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f7b8894](https://github.com/home-lang/pantry/commit/f7b8894)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a42ca1f](https://github.com/home-lang/pantry/commit/a42ca1f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d0189b6](https://github.com/home-lang/pantry/commit/d0189b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([87ab9ce](https://github.com/home-lang/pantry/commit/87ab9ce)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([01fa7ea](https://github.com/home-lang/pantry/commit/01fa7ea)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ce4f45f](https://github.com/home-lang/pantry/commit/ce4f45f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([94a846c](https://github.com/home-lang/pantry/commit/94a846c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([75a5511](https://github.com/home-lang/pantry/commit/75a5511)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([61917b5](https://github.com/home-lang/pantry/commit/61917b5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0f46a88](https://github.com/home-lang/pantry/commit/0f46a88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d1d4d25](https://github.com/home-lang/pantry/commit/d1d4d25)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([771e328](https://github.com/home-lang/pantry/commit/771e328)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([13739a7](https://github.com/home-lang/pantry/commit/13739a7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1b831b2](https://github.com/home-lang/pantry/commit/1b831b2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0cd3ae1](https://github.com/home-lang/pantry/commit/0cd3ae1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6939992](https://github.com/home-lang/pantry/commit/6939992)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([07031b6](https://github.com/home-lang/pantry/commit/07031b6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0d9aaa](https://github.com/home-lang/pantry/commit/f0d9aaa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4692d44](https://github.com/home-lang/pantry/commit/4692d44)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5ed8f7a](https://github.com/home-lang/pantry/commit/5ed8f7a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6e66d7d](https://github.com/home-lang/pantry/commit/6e66d7d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8f0c3f8](https://github.com/home-lang/pantry/commit/8f0c3f8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([6335171](https://github.com/home-lang/pantry/commit/6335171)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e17c2fd](https://github.com/home-lang/pantry/commit/e17c2fd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([139058a](https://github.com/home-lang/pantry/commit/139058a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5611227](https://github.com/home-lang/pantry/commit/5611227)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([70df5eb](https://github.com/home-lang/pantry/commit/70df5eb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b3a30fe](https://github.com/home-lang/pantry/commit/b3a30fe)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0bc1242](https://github.com/home-lang/pantry/commit/0bc1242)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fa7f3f6](https://github.com/home-lang/pantry/commit/fa7f3f6)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d56b162](https://github.com/home-lang/pantry/commit/d56b162)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1bf190f](https://github.com/home-lang/pantry/commit/1bf190f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([579cf81](https://github.com/home-lang/pantry/commit/579cf81)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([881e629](https://github.com/home-lang/pantry/commit/881e629)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2cb2603](https://github.com/home-lang/pantry/commit/2cb2603)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([badc05b](https://github.com/home-lang/pantry/commit/badc05b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([18b1ab5](https://github.com/home-lang/pantry/commit/18b1ab5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4befa2a](https://github.com/home-lang/pantry/commit/4befa2a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0c42f1d](https://github.com/home-lang/pantry/commit/0c42f1d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4ec64e9](https://github.com/home-lang/pantry/commit/4ec64e9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4c1de1c](https://github.com/home-lang/pantry/commit/4c1de1c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d332084](https://github.com/home-lang/pantry/commit/d332084)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c86506a](https://github.com/home-lang/pantry/commit/c86506a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b9f277b](https://github.com/home-lang/pantry/commit/b9f277b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b974496](https://github.com/home-lang/pantry/commit/b974496)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([071cbad](https://github.com/home-lang/pantry/commit/071cbad)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([64bff24](https://github.com/home-lang/pantry/commit/64bff24)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([04b34de](https://github.com/home-lang/pantry/commit/04b34de)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d37014b](https://github.com/home-lang/pantry/commit/d37014b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([333ee27](https://github.com/home-lang/pantry/commit/333ee27)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c988874](https://github.com/home-lang/pantry/commit/c988874)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d77c526](https://github.com/home-lang/pantry/commit/d77c526)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([552b24e](https://github.com/home-lang/pantry/commit/552b24e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([58ccb50](https://github.com/home-lang/pantry/commit/58ccb50)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cf1f96b](https://github.com/home-lang/pantry/commit/cf1f96b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([20bb789](https://github.com/home-lang/pantry/commit/20bb789)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8386d7c](https://github.com/home-lang/pantry/commit/8386d7c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3a64c1b](https://github.com/home-lang/pantry/commit/3a64c1b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a9d0ebc](https://github.com/home-lang/pantry/commit/a9d0ebc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0907080](https://github.com/home-lang/pantry/commit/0907080)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5be397d](https://github.com/home-lang/pantry/commit/5be397d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b8684f2](https://github.com/home-lang/pantry/commit/b8684f2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c75c02f](https://github.com/home-lang/pantry/commit/c75c02f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bbdd28b](https://github.com/home-lang/pantry/commit/bbdd28b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c0a5358](https://github.com/home-lang/pantry/commit/c0a5358)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2067abd](https://github.com/home-lang/pantry/commit/2067abd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([80c02f8](https://github.com/home-lang/pantry/commit/80c02f8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4626bc7](https://github.com/home-lang/pantry/commit/4626bc7)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([12296b4](https://github.com/home-lang/pantry/commit/12296b4)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([9bbf5a5](https://github.com/home-lang/pantry/commit/9bbf5a5)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([da87f3a](https://github.com/home-lang/pantry/commit/da87f3a)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([ef3e5b1](https://github.com/home-lang/pantry/commit/ef3e5b1)) _(by Adelino Ngomacha <adelinob335@gmail.com>)_
- wip ([aacc3fa](https://github.com/home-lang/pantry/commit/aacc3fa)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e98ce80](https://github.com/home-lang/pantry/commit/e98ce80)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([4caee27](https://github.com/home-lang/pantry/commit/4caee27)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f5be4b4](https://github.com/home-lang/pantry/commit/f5be4b4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([77e92f9](https://github.com/home-lang/pantry/commit/77e92f9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9856e50](https://github.com/home-lang/pantry/commit/9856e50)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2490f0f](https://github.com/home-lang/pantry/commit/2490f0f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e00a816](https://github.com/home-lang/pantry/commit/e00a816)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0ddb6a](https://github.com/home-lang/pantry/commit/f0ddb6a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e7a2d81](https://github.com/home-lang/pantry/commit/e7a2d81)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b44f668](https://github.com/home-lang/pantry/commit/b44f668)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([66a0ee9](https://github.com/home-lang/pantry/commit/66a0ee9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1762256](https://github.com/home-lang/pantry/commit/1762256)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f3aedcd](https://github.com/home-lang/pantry/commit/f3aedcd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([05d5e60](https://github.com/home-lang/pantry/commit/05d5e60)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b99f195](https://github.com/home-lang/pantry/commit/b99f195)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ee4e947](https://github.com/home-lang/pantry/commit/ee4e947)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d6114bc](https://github.com/home-lang/pantry/commit/d6114bc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9508751](https://github.com/home-lang/pantry/commit/9508751)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3f1ba8d](https://github.com/home-lang/pantry/commit/3f1ba8d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eae7f34](https://github.com/home-lang/pantry/commit/eae7f34)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e0d251a](https://github.com/home-lang/pantry/commit/e0d251a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f7ef652](https://github.com/home-lang/pantry/commit/f7ef652)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([03b9c29](https://github.com/home-lang/pantry/commit/03b9c29)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([60dc5ee](https://github.com/home-lang/pantry/commit/60dc5ee)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a10decf](https://github.com/home-lang/pantry/commit/a10decf)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b338ced](https://github.com/home-lang/pantry/commit/b338ced)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([fb14b59](https://github.com/home-lang/pantry/commit/fb14b59)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d9a7d2d](https://github.com/home-lang/pantry/commit/d9a7d2d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([df99193](https://github.com/home-lang/pantry/commit/df99193)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d9abd59](https://github.com/home-lang/pantry/commit/d9abd59)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d588ebc](https://github.com/home-lang/pantry/commit/d588ebc)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([9f823c1](https://github.com/home-lang/pantry/commit/9f823c1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([cf61c96](https://github.com/home-lang/pantry/commit/cf61c96)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0af1e14](https://github.com/home-lang/pantry/commit/0af1e14)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2455159](https://github.com/home-lang/pantry/commit/2455159)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a949c53](https://github.com/home-lang/pantry/commit/a949c53)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([00a1d8c](https://github.com/home-lang/pantry/commit/00a1d8c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c022676](https://github.com/home-lang/pantry/commit/c022676)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([11aab6e](https://github.com/home-lang/pantry/commit/11aab6e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e572aba](https://github.com/home-lang/pantry/commit/e572aba)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f2ed9a4](https://github.com/home-lang/pantry/commit/f2ed9a4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([12583ca](https://github.com/home-lang/pantry/commit/12583ca)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d0f4d9](https://github.com/home-lang/pantry/commit/1d0f4d9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e8cb2fb](https://github.com/home-lang/pantry/commit/e8cb2fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([145f908](https://github.com/home-lang/pantry/commit/145f908)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([51566dd](https://github.com/home-lang/pantry/commit/51566dd)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e613ce1](https://github.com/home-lang/pantry/commit/e613ce1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7fe322e](https://github.com/home-lang/pantry/commit/7fe322e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([48d278c](https://github.com/home-lang/pantry/commit/48d278c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([2de3b88](https://github.com/home-lang/pantry/commit/2de3b88)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1a51d1b](https://github.com/home-lang/pantry/commit/1a51d1b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([19be332](https://github.com/home-lang/pantry/commit/19be332)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8973d73](https://github.com/home-lang/pantry/commit/8973d73)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([facbeea](https://github.com/home-lang/pantry/commit/facbeea)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([985e671](https://github.com/home-lang/pantry/commit/985e671)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ce7221d](https://github.com/home-lang/pantry/commit/ce7221d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([241e943](https://github.com/home-lang/pantry/commit/241e943)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1d6db31](https://github.com/home-lang/pantry/commit/1d6db31)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([bdff3a5](https://github.com/home-lang/pantry/commit/bdff3a5)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dcf90c8](https://github.com/home-lang/pantry/commit/dcf90c8)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f1412db](https://github.com/home-lang/pantry/commit/f1412db)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eecb671](https://github.com/home-lang/pantry/commit/eecb671)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3d4bd79](https://github.com/home-lang/pantry/commit/3d4bd79)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([14c04c7](https://github.com/home-lang/pantry/commit/14c04c7)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3ccbf93](https://github.com/home-lang/pantry/commit/3ccbf93)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0758d58](https://github.com/home-lang/pantry/commit/0758d58)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dceaba0](https://github.com/home-lang/pantry/commit/dceaba0)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([69b707c](https://github.com/home-lang/pantry/commit/69b707c)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([ae10ac2](https://github.com/home-lang/pantry/commit/ae10ac2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([88eda8b](https://github.com/home-lang/pantry/commit/88eda8b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([eae1971](https://github.com/home-lang/pantry/commit/eae1971)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f3f5bb3](https://github.com/home-lang/pantry/commit/f3f5bb3)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0898c3b](https://github.com/home-lang/pantry/commit/0898c3b)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([444a63a](https://github.com/home-lang/pantry/commit/444a63a)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e9d896d](https://github.com/home-lang/pantry/commit/e9d896d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([0fed2d9](https://github.com/home-lang/pantry/commit/0fed2d9)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([74b8561](https://github.com/home-lang/pantry/commit/74b8561)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([62f8f20](https://github.com/home-lang/pantry/commit/62f8f20)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([b506eb2](https://github.com/home-lang/pantry/commit/b506eb2)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([1a6fc6d](https://github.com/home-lang/pantry/commit/1a6fc6d)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([67fce92](https://github.com/home-lang/pantry/commit/67fce92)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([13da29f](https://github.com/home-lang/pantry/commit/13da29f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([8329dce](https://github.com/home-lang/pantry/commit/8329dce)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([79d00fb](https://github.com/home-lang/pantry/commit/79d00fb)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([f0de567](https://github.com/home-lang/pantry/commit/f0de567)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([d732c72](https://github.com/home-lang/pantry/commit/d732c72)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Adelino Ngomacha <adelinob335@gmail.com>_
- _Chris <chrisbreuer93@gmail.com>_

## v0.6.3...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.6.3...main)

### 🏡 Chore

- Wip ([3bdb4e4](https://github.com/stacksjs/launchpad/commit/3bdb4e4))
- Wip ([c3e5587](https://github.com/stacksjs/launchpad/commit/c3e5587))
- Wip ([ea25ad4](https://github.com/stacksjs/launchpad/commit/ea25ad4))
- Wip ([e37525d](https://github.com/stacksjs/launchpad/commit/e37525d))
- Wip ([48158c4](https://github.com/stacksjs/launchpad/commit/48158c4))
- Wip ([05306d8](https://github.com/stacksjs/launchpad/commit/05306d8))
- Wip ([09d81ac](https://github.com/stacksjs/launchpad/commit/09d81ac))
- Wip ([26ca5f6](https://github.com/stacksjs/launchpad/commit/26ca5f6))
- Wip ([1f87d46](https://github.com/stacksjs/launchpad/commit/1f87d46))
- Wip ([f105f02](https://github.com/stacksjs/launchpad/commit/f105f02))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## binaries-90...binaries-90

[compare changes](https://github.com/stacksjs/launchpad/compare/binaries-90...binaries-90)

## v0.6.1...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.6.1...main)

### 🏡 Chore

- Wip ([d65da8c](https://github.com/stacksjs/launchpad/commit/d65da8c))
- Wip ([6b19717](https://github.com/stacksjs/launchpad/commit/6b19717))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.6.0...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.6.0...main)

### 🏡 Chore

- Wip ([7049ab1](https://github.com/stacksjs/launchpad/commit/7049ab1))
- Wip ([01df685](https://github.com/stacksjs/launchpad/commit/01df685))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## binaries-79...main

[compare changes](https://github.com/stacksjs/launchpad/compare/binaries-79...main)

### 🏡 Chore

- Wip ([ee52259](https://github.com/stacksjs/launchpad/commit/ee52259))
- Wip ([1782c6d](https://github.com/stacksjs/launchpad/commit/1782c6d))
- Wip ([a9c719a](https://github.com/stacksjs/launchpad/commit/a9c719a))
- Wip ([5d744b5](https://github.com/stacksjs/launchpad/commit/5d744b5))
- Wip ([c8866f2](https://github.com/stacksjs/launchpad/commit/c8866f2))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.5.1...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.5.1...main)

### 🏡 Chore

- Minor updates ([5137c37](https://github.com/stacksjs/launchpad/commit/5137c37))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.5.0...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.5.0...main)

### 🏡 Chore

- Adjust binary permissions ([f479595](https://github.com/stacksjs/launchpad/commit/f479595))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.26...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.26...main)

### 🚀 Enhancements

- Add `keep-global` option ([2a1f733](https://github.com/stacksjs/launchpad/commit/2a1f733))
- Add service management ([c60a4b0](https://github.com/stacksjs/launchpad/commit/c60a4b0))

### 🏡 Chore

- More minor output improvements ([3b10af8](https://github.com/stacksjs/launchpad/commit/3b10af8))
- Improve output ([4f951e4](https://github.com/stacksjs/launchpad/commit/4f951e4))
- Wip ([7cda06a](https://github.com/stacksjs/launchpad/commit/7cda06a))
- Wip ([432f1a4](https://github.com/stacksjs/launchpad/commit/432f1a4))
- Wip ([49cd237](https://github.com/stacksjs/launchpad/commit/49cd237))
- Wip ([c6cca34](https://github.com/stacksjs/launchpad/commit/c6cca34))
- Wip ([281ace0](https://github.com/stacksjs/launchpad/commit/281ace0))
- Wip ([70cc47d](https://github.com/stacksjs/launchpad/commit/70cc47d))
- Wip ([85bfc81](https://github.com/stacksjs/launchpad/commit/85bfc81))
- Wip ([655fb23](https://github.com/stacksjs/launchpad/commit/655fb23))
- Ensure cli is built ([84e8207](https://github.com/stacksjs/launchpad/commit/84e8207))
- Wip ([e1fdf6e](https://github.com/stacksjs/launchpad/commit/e1fdf6e))
- Adjust activation message logic ([a99d9f5](https://github.com/stacksjs/launchpad/commit/a99d9f5))
- Improve dependency resolution ([dac21ff](https://github.com/stacksjs/launchpad/commit/dac21ff))
- Wip ([5548fcf](https://github.com/stacksjs/launchpad/commit/5548fcf))
- Wip ([7476202](https://github.com/stacksjs/launchpad/commit/7476202))
- Wip ([bbe5338](https://github.com/stacksjs/launchpad/commit/bbe5338))
- Wip ([fe800f8](https://github.com/stacksjs/launchpad/commit/fe800f8))
- Wip ([5eb64b3](https://github.com/stacksjs/launchpad/commit/5eb64b3))
- Wip ([6fb12b7](https://github.com/stacksjs/launchpad/commit/6fb12b7))
- Wip ([d56d2c6](https://github.com/stacksjs/launchpad/commit/d56d2c6))
- Wip ([57ad50b](https://github.com/stacksjs/launchpad/commit/57ad50b))
- Improve library path management ([7e319c7](https://github.com/stacksjs/launchpad/commit/7e319c7))
- Wip ([452a6d6](https://github.com/stacksjs/launchpad/commit/452a6d6))
- Wip ([5ab5c64](https://github.com/stacksjs/launchpad/commit/5ab5c64))
- Wip ([0d8ac79](https://github.com/stacksjs/launchpad/commit/0d8ac79))
- Wip ([51f2721](https://github.com/stacksjs/launchpad/commit/51f2721))
- Wip ([afffc8a](https://github.com/stacksjs/launchpad/commit/afffc8a))
- Wip ([ec57a27](https://github.com/stacksjs/launchpad/commit/ec57a27))
- Wip ([c89d4c4](https://github.com/stacksjs/launchpad/commit/c89d4c4))
- Wip ([bb44857](https://github.com/stacksjs/launchpad/commit/bb44857))
- Wip ([5ca3b63](https://github.com/stacksjs/launchpad/commit/5ca3b63))
- Wip ([80be6da](https://github.com/stacksjs/launchpad/commit/80be6da))
- Wip ([ac7fa1f](https://github.com/stacksjs/launchpad/commit/ac7fa1f))
- Wip ([df31e9a](https://github.com/stacksjs/launchpad/commit/df31e9a))
- Wip ([43f0137](https://github.com/stacksjs/launchpad/commit/43f0137))
- Wip ([6d828ef](https://github.com/stacksjs/launchpad/commit/6d828ef))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.25...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.25...main)

### 🏡 Chore

- Wip ([49aff28](https://github.com/stacksjs/launchpad/commit/49aff28))
- Wip ([eba410a](https://github.com/stacksjs/launchpad/commit/eba410a))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.24...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.24...main)

### 🏡 Chore

- Polish the output ([abf7fb6](https://github.com/stacksjs/launchpad/commit/abf7fb6))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.23...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.23...main)

### 🩹 Fixes

- Install platform specific deps correctly ([03926ba](https://github.com/stacksjs/launchpad/commit/03926ba))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.22...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.22...main)

### 🏡 Chore

- Update deps ([0cfa3d0](https://github.com/stacksjs/launchpad/commit/0cfa3d0))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.21...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.21...main)

### 🏡 Chore

- Resolution updates ([f106890](https://github.com/stacksjs/launchpad/commit/f106890))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.20...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.20...main)

### 🏡 Chore

- More log output adjustments ([d0f0a1d](https://github.com/stacksjs/launchpad/commit/d0f0a1d))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.19...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.19...main)

### 🏡 Chore

- Minor updates ([8de52ff](https://github.com/stacksjs/launchpad/commit/8de52ff))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.18...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.18...main)

### 🏡 Chore

- Improve output ([15e9c7a](https://github.com/stacksjs/launchpad/commit/15e9c7a))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.17...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.17...main)

### 🚀 Enhancements

- Add remove `all` option ([11c877d](https://github.com/stacksjs/launchpad/commit/11c877d))

### 🏡 Chore

- Improve install output ([3b8c194](https://github.com/stacksjs/launchpad/commit/3b8c194))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.16...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.16...main)

### 🏡 Chore

- Adjust test ([6e9f599](https://github.com/stacksjs/launchpad/commit/6e9f599))
- Adjust progress visual ([c48bdf6](https://github.com/stacksjs/launchpad/commit/c48bdf6))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.15...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.15...main)

### 🏡 Chore

- Improve `upgrade` command ([91f5bee](https://github.com/stacksjs/launchpad/commit/91f5bee))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.14...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.14...main)

### 🏡 Chore

- Update cover image ([ee04a19](https://github.com/stacksjs/launchpad/commit/ee04a19))
- Stability improvements ([81452a2](https://github.com/stacksjs/launchpad/commit/81452a2))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.13...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.13...main)

### 🏡 Chore

- Update bunfig ([e05e157](https://github.com/stacksjs/launchpad/commit/e05e157))
- Update lockfile ([c73f6a9](https://github.com/stacksjs/launchpad/commit/c73f6a9))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.12...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.12...main)

### 🏡 Chore

- Add shell-safe option ([70ef1d1](https://github.com/stacksjs/launchpad/commit/70ef1d1))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.11...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.11...main)

### 🏡 Chore

- Adjust download progress ([a611f36](https://github.com/stacksjs/launchpad/commit/a611f36))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.10...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.10...main)

### 🏡 Chore

- Adjust shellcode ([b715e55](https://github.com/stacksjs/launchpad/commit/b715e55))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.9...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.9...main)

### 🏡 Chore

- Improve upgrade command ([c996b62](https://github.com/stacksjs/launchpad/commit/c996b62))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.8...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.8...main)

### 🏡 Chore

- Add starship compatibility notice ([07d6622](https://github.com/stacksjs/launchpad/commit/07d6622))
- Wip ([c216123](https://github.com/stacksjs/launchpad/commit/c216123))
- Improve transient dependency installs ([1c7d916](https://github.com/stacksjs/launchpad/commit/1c7d916))
- Lint ([4a1eaeb](https://github.com/stacksjs/launchpad/commit/4a1eaeb))
- Get test to pass ([d2358d1](https://github.com/stacksjs/launchpad/commit/d2358d1))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.7...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.7...main)

### 🏡 Chore

- Minor adjustments ([c2dd216](https://github.com/stacksjs/launchpad/commit/c2dd216))
- Test updates ([af71d3c](https://github.com/stacksjs/launchpad/commit/af71d3c))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.6...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.6...main)

### 🏡 Chore

- Perf improvements ([0a40465](https://github.com/stacksjs/launchpad/commit/0a40465))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.5...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.5...main)

### 🏡 Chore

- Resolve tests ([d03fbcc](https://github.com/stacksjs/launchpad/commit/d03fbcc))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.4...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.4...main)

### 🏡 Chore

- Minor updates ([1d1e671](https://github.com/stacksjs/launchpad/commit/1d1e671))
- Lint ([2a3fc10](https://github.com/stacksjs/launchpad/commit/2a3fc10))
- Improve stability ([b54f645](https://github.com/stacksjs/launchpad/commit/b54f645))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.3...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.3...main)

### 🏡 Chore

- Refactor upgrade/setup logic ([c3da1ee](https://github.com/stacksjs/launchpad/commit/c3da1ee))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.2...v0.4.2

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.2...v0.4.2)

## v0.4.1...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.1...main)

### 🏡 Chore

- Update lockfile ([d6ad925](https://github.com/stacksjs/launchpad/commit/d6ad925))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.4.1...v0.4.1

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.1...v0.4.1)

## v0.4.0...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.4.0...main)

### 🏡 Chore

- Resolve type issues ([30c54e4](https://github.com/stacksjs/launchpad/commit/30c54e4))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.12...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.12...main)

### 🚀 Enhancements

- Add `upgrade` command ([793ee1c](https://github.com/stacksjs/launchpad/commit/793ee1c))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.11...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.11...main)

### 🏡 Chore

- Add dynamic version ([28894cd](https://github.com/stacksjs/launchpad/commit/28894cd))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.10...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.10...main)

### 🚀 Enhancements

- Update setup command default version to v0.3.10 ([f22062e](https://github.com/stacksjs/launchpad/commit/f22062e))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.9...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.9...main)

### 🩹 Fixes

- Update ts-pkgx to v0.3.63 with dynamic playwright imports ([ce1866b](https://github.com/stacksjs/launchpad/commit/ce1866b))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.9...v0.3.9

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.9...v0.3.9)

## v0.3.8...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.8...main)

### 🏡 Chore

- Wip ([3eb5a0e](https://github.com/stacksjs/launchpad/commit/3eb5a0e))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.7...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.7...main)

### 🏡 Chore

- Minor adjustments ([cadb40d](https://github.com/stacksjs/launchpad/commit/cadb40d))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.6...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.6...main)

### 🚀 Enhancements

- Add `setup` command ([b9791ad](https://github.com/stacksjs/launchpad/commit/b9791ad))

### 🏡 Chore

- Adjust build ([fb5895c](https://github.com/stacksjs/launchpad/commit/fb5895c))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.5...v0.3.5

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.5...v0.3.5)

## v0.3.3...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.3...main)

### 🏡 Chore

- Wip ([b12c84a](https://github.com/stacksjs/launchpad/commit/b12c84a))
- Stabilize installs ([ea1d639](https://github.com/stacksjs/launchpad/commit/ea1d639))
- Get tests to pass ([881eb0d](https://github.com/stacksjs/launchpad/commit/881eb0d))
- Lint ([97f0dd5](https://github.com/stacksjs/launchpad/commit/97f0dd5))
- Test updates ([fa7070d](https://github.com/stacksjs/launchpad/commit/fa7070d))
- Release v0.3.4 ([64891a1](https://github.com/stacksjs/launchpad/commit/64891a1))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.3...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.3...main)

### 🏡 Chore

- Wip ([b12c84a](https://github.com/stacksjs/launchpad/commit/b12c84a))
- Stabilize installs ([ea1d639](https://github.com/stacksjs/launchpad/commit/ea1d639))
- Get tests to pass ([881eb0d](https://github.com/stacksjs/launchpad/commit/881eb0d))
- Lint ([97f0dd5](https://github.com/stacksjs/launchpad/commit/97f0dd5))
- Test updates ([fa7070d](https://github.com/stacksjs/launchpad/commit/fa7070d))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.2...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.2...main)

### 🏡 Chore

- Wip ([1dc4482](https://github.com/stacksjs/launchpad/commit/1dc4482))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.1...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.1...main)

### 🏡 Chore

- Wip ([34b793f](https://github.com/stacksjs/launchpad/commit/34b793f))
- Wip ([cfd8a5e](https://github.com/stacksjs/launchpad/commit/cfd8a5e))
- Wip ([d45c846](https://github.com/stacksjs/launchpad/commit/d45c846))
- Wip ([8219e39](https://github.com/stacksjs/launchpad/commit/8219e39))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.3.0...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.3.0...main)

### 🏡 Chore

- Wip ([bccbb31](https://github.com/stacksjs/launchpad/commit/bccbb31))
- Wip ([d4d2c02](https://github.com/stacksjs/launchpad/commit/d4d2c02))
- Add env tests ([91c7034](https://github.com/stacksjs/launchpad/commit/91c7034))
- Ensure tests pass ([f054881](https://github.com/stacksjs/launchpad/commit/f054881))
- Wip ([529cf14](https://github.com/stacksjs/launchpad/commit/529cf14))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.2.3...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.2.3...main)

### 🚀 Enhancements

- Add `global` support ([e92e28d](https://github.com/stacksjs/launchpad/commit/e92e28d))
- Add registry update command and improve install error handling - Added update-registry CLI command for updating package registry from S3 - Enhanced install error handling with better permission error messages - Added known problematic packages filtering to reduce noise - Improved dependency installation with better error recovery - Added dry-run support for registry updates ([30342d4](https://github.com/stacksjs/launchpad/commit/30342d4))

### 🏡 Chore

- Use `dev` command ([81403bb](https://github.com/stacksjs/launchpad/commit/81403bb))
- Adjust wording ([ffbdd1b](https://github.com/stacksjs/launchpad/commit/ffbdd1b))
- Housekeeping ([7edc2b6](https://github.com/stacksjs/launchpad/commit/7edc2b6))
- Improve the search output ([d8a42a3](https://github.com/stacksjs/launchpad/commit/d8a42a3))
- Improve output message ([b3ff5a5](https://github.com/stacksjs/launchpad/commit/b3ff5a5))
- Wip ([6491d67](https://github.com/stacksjs/launchpad/commit/6491d67))
- Wip ([1d44e7b](https://github.com/stacksjs/launchpad/commit/1d44e7b))
- Wip ([38d130f](https://github.com/stacksjs/launchpad/commit/38d130f))
- Wip ([c08667c](https://github.com/stacksjs/launchpad/commit/c08667c))
- Wip ([183bff9](https://github.com/stacksjs/launchpad/commit/183bff9))
- Wip ([10b72f6](https://github.com/stacksjs/launchpad/commit/10b72f6))
- Wip ([9208285](https://github.com/stacksjs/launchpad/commit/9208285))
- Wip ([9248c83](https://github.com/stacksjs/launchpad/commit/9248c83))
- Wip ([7632558](https://github.com/stacksjs/launchpad/commit/7632558))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.2.2...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.2.2...main)

### 🏡 Chore

- Lint ([2205912](https://github.com/stacksjs/launchpad/commit/2205912))
- Adjust test cases ([3a327bc](https://github.com/stacksjs/launchpad/commit/3a327bc))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.2.1...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.2.1...main)

### 🏡 Chore

- Add `add` alias ([2e300cb](https://github.com/stacksjs/launchpad/commit/2e300cb))
- Improve `uninstall` logic ([798bc06](https://github.com/stacksjs/launchpad/commit/798bc06))
- Italicize domain name ([484775f](https://github.com/stacksjs/launchpad/commit/484775f))
- Improve cleanup logic ([7a47e04](https://github.com/stacksjs/launchpad/commit/7a47e04))
- Minor updates ([bd9e6b2](https://github.com/stacksjs/launchpad/commit/bd9e6b2))
- Adjust install process ([857c14e](https://github.com/stacksjs/launchpad/commit/857c14e))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.2.0...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.2.0...main)

### 🏡 Chore

- Slightly improve install output ([9c9ef25](https://github.com/stacksjs/launchpad/commit/9c9ef25))
- Improve `update` command ([1656f62](https://github.com/stacksjs/launchpad/commit/1656f62))
- Improve jsdocs ([b7cbaf4](https://github.com/stacksjs/launchpad/commit/b7cbaf4))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.1.2...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.1.2...main)

### 🚀 Enhancements

- Add ux for installation process ([a9f5623](https://github.com/stacksjs/launchpad/commit/a9f5623))
- Add search logic ([e1b8bca](https://github.com/stacksjs/launchpad/commit/e1b8bca))
- Add info logic ([3e30296](https://github.com/stacksjs/launchpad/commit/3e30296))
- Add doctor command ([15520aa](https://github.com/stacksjs/launchpad/commit/15520aa))
- Add tags logic ([6a0f65c](https://github.com/stacksjs/launchpad/commit/6a0f65c))
- Add `cache:clear` and `clean` commands ([547ecba](https://github.com/stacksjs/launchpad/commit/547ecba))

### 🏡 Chore

- Wip ([0cc99f3](https://github.com/stacksjs/launchpad/commit/0cc99f3))
- Improve type ([9165be5](https://github.com/stacksjs/launchpad/commit/9165be5))
- Several improvements ([0e16b79](https://github.com/stacksjs/launchpad/commit/0e16b79))
- Adjust readme ([db0da37](https://github.com/stacksjs/launchpad/commit/db0da37))
- Minor updates ([b1ff26b](https://github.com/stacksjs/launchpad/commit/b1ff26b))
- Improve cleanup performance ([2ff1034](https://github.com/stacksjs/launchpad/commit/2ff1034))
- Update pantry ([84f99bd](https://github.com/stacksjs/launchpad/commit/84f99bd))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.1.1...main

[compare changes](https://github.com/stacksjs/launchpad/compare/v0.1.1...main)

### 🏡 Chore

- Make file executable ([4454ae7](https://github.com/stacksjs/launchpad/commit/4454ae7))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## ...main

### 🏡 Chore

- Initial commit ([2454942](https://github.com/stacksjs/launchpad/commit/2454942))
- Wip ([2672e50](https://github.com/stacksjs/launchpad/commit/2672e50))
- Wip ([ee1a903](https://github.com/stacksjs/launchpad/commit/ee1a903))
- Wip ([eafa093](https://github.com/stacksjs/launchpad/commit/eafa093))
- Wip ([6f8481e](https://github.com/stacksjs/launchpad/commit/6f8481e))
- Wip ([9ae4101](https://github.com/stacksjs/launchpad/commit/9ae4101))
- Wip ([739a132](https://github.com/stacksjs/launchpad/commit/739a132))
- Wip ([6cd4562](https://github.com/stacksjs/launchpad/commit/6cd4562))
- Wip ([3aa13ce](https://github.com/stacksjs/launchpad/commit/3aa13ce))
- Wip ([3489037](https://github.com/stacksjs/launchpad/commit/3489037))
- Wip ([2cb614e](https://github.com/stacksjs/launchpad/commit/2cb614e))
- Wip ([cb97f38](https://github.com/stacksjs/launchpad/commit/cb97f38))
- Wip ([a2acc78](https://github.com/stacksjs/launchpad/commit/a2acc78))
- Wip ([e468832](https://github.com/stacksjs/launchpad/commit/e468832))
- Wip ([9f5f949](https://github.com/stacksjs/launchpad/commit/9f5f949))
- Wip ([f007bcc](https://github.com/stacksjs/launchpad/commit/f007bcc))
- Wip ([215bdc2](https://github.com/stacksjs/launchpad/commit/215bdc2))
- Wip ([472db36](https://github.com/stacksjs/launchpad/commit/472db36))
- Wip ([93bd561](https://github.com/stacksjs/launchpad/commit/93bd561))
- Wip ([c35a57a](https://github.com/stacksjs/launchpad/commit/c35a57a))
- Wip ([d41169b](https://github.com/stacksjs/launchpad/commit/d41169b))
- Wip ([ab78d52](https://github.com/stacksjs/launchpad/commit/ab78d52))
- Wip ([446075d](https://github.com/stacksjs/launchpad/commit/446075d))
- Wip ([64c274e](https://github.com/stacksjs/launchpad/commit/64c274e))
- Wip ([676acc5](https://github.com/stacksjs/launchpad/commit/676acc5))
- Wip ([0650add](https://github.com/stacksjs/launchpad/commit/0650add))
- Wip ([8236d54](https://github.com/stacksjs/launchpad/commit/8236d54))
- Wip ([5dae479](https://github.com/stacksjs/launchpad/commit/5dae479))
- Wip ([c817c31](https://github.com/stacksjs/launchpad/commit/c817c31))
- Wip ([ceb6e27](https://github.com/stacksjs/launchpad/commit/ceb6e27))
- Wip ([accac5b](https://github.com/stacksjs/launchpad/commit/accac5b))
- Wip ([2854042](https://github.com/stacksjs/launchpad/commit/2854042))
- Wip ([228bf73](https://github.com/stacksjs/launchpad/commit/228bf73))
- Wip ([2e58f31](https://github.com/stacksjs/launchpad/commit/2e58f31))
- Wip ([c4de3ca](https://github.com/stacksjs/launchpad/commit/c4de3ca))
- Wip ([329a189](https://github.com/stacksjs/launchpad/commit/329a189))
- Wip ([b8cc5d0](https://github.com/stacksjs/launchpad/commit/b8cc5d0))
- Wip ([0295984](https://github.com/stacksjs/launchpad/commit/0295984))
- Wip ([a59a143](https://github.com/stacksjs/launchpad/commit/a59a143))
- Wip ([d131620](https://github.com/stacksjs/launchpad/commit/d131620))
- Wip ([2d9f2a6](https://github.com/stacksjs/launchpad/commit/2d9f2a6))
- Wip ([67e60a9](https://github.com/stacksjs/launchpad/commit/67e60a9))
- Wip ([7d8c1ec](https://github.com/stacksjs/launchpad/commit/7d8c1ec))
- Wip ([16454de](https://github.com/stacksjs/launchpad/commit/16454de))
- Wip ([a0da66e](https://github.com/stacksjs/launchpad/commit/a0da66e))
- Wip ([4d1a2f2](https://github.com/stacksjs/launchpad/commit/4d1a2f2))
- Wip ([4465e4e](https://github.com/stacksjs/launchpad/commit/4465e4e))
- Wip ([21e9650](https://github.com/stacksjs/launchpad/commit/21e9650))
- Wip ([be93cc0](https://github.com/stacksjs/launchpad/commit/be93cc0))
- Wip ([a5f856e](https://github.com/stacksjs/launchpad/commit/a5f856e))
- Wip ([95e51b9](https://github.com/stacksjs/launchpad/commit/95e51b9))
- Wip ([d1da0b3](https://github.com/stacksjs/launchpad/commit/d1da0b3))
- Wip ([882f80d](https://github.com/stacksjs/launchpad/commit/882f80d))
- Wip ([5a17972](https://github.com/stacksjs/launchpad/commit/5a17972))
- Wip ([0fcc868](https://github.com/stacksjs/launchpad/commit/0fcc868))
- Wip ([ada1bb8](https://github.com/stacksjs/launchpad/commit/ada1bb8))
- Wip ([a1f68a0](https://github.com/stacksjs/launchpad/commit/a1f68a0))
- Wip ([c66fc9f](https://github.com/stacksjs/launchpad/commit/c66fc9f))
- Wip ([409be99](https://github.com/stacksjs/launchpad/commit/409be99))
- Wip ([90c8be1](https://github.com/stacksjs/launchpad/commit/90c8be1))
- Wip ([09133e6](https://github.com/stacksjs/launchpad/commit/09133e6))
- Wip ([6cf71a8](https://github.com/stacksjs/launchpad/commit/6cf71a8))
- Wip ([2b0edeb](https://github.com/stacksjs/launchpad/commit/2b0edeb))
- Wip ([5a467fd](https://github.com/stacksjs/launchpad/commit/5a467fd))
- Wip ([55b5f5f](https://github.com/stacksjs/launchpad/commit/55b5f5f))
- Wip ([d4c0b9d](https://github.com/stacksjs/launchpad/commit/d4c0b9d))
- Wip ([787e77d](https://github.com/stacksjs/launchpad/commit/787e77d))
- Wip ([08d9066](https://github.com/stacksjs/launchpad/commit/08d9066))
- Wip ([2f9debf](https://github.com/stacksjs/launchpad/commit/2f9debf))
- Wip ([c6fb084](https://github.com/stacksjs/launchpad/commit/c6fb084))
- Wip ([8788fbf](https://github.com/stacksjs/launchpad/commit/8788fbf))
- Wip ([dafd112](https://github.com/stacksjs/launchpad/commit/dafd112))
- Wip ([ba8156d](https://github.com/stacksjs/launchpad/commit/ba8156d))
- Wip ([9dc0184](https://github.com/stacksjs/launchpad/commit/9dc0184))
- Wip ([40b724e](https://github.com/stacksjs/launchpad/commit/40b724e))
- Wip ([70fc7da](https://github.com/stacksjs/launchpad/commit/70fc7da))
- Wip ([24a0046](https://github.com/stacksjs/launchpad/commit/24a0046))
- Wip ([dd16800](https://github.com/stacksjs/launchpad/commit/dd16800))
- Wip ([f288102](https://github.com/stacksjs/launchpad/commit/f288102))
- Wip ([06b765f](https://github.com/stacksjs/launchpad/commit/06b765f))
- Wip ([c8d456b](https://github.com/stacksjs/launchpad/commit/c8d456b))
- Wip ([26ca9a3](https://github.com/stacksjs/launchpad/commit/26ca9a3))
- Wip ([90fdbe0](https://github.com/stacksjs/launchpad/commit/90fdbe0))
- Wip ([a9d29c9](https://github.com/stacksjs/launchpad/commit/a9d29c9))
- Wip ([eb2ff2c](https://github.com/stacksjs/launchpad/commit/eb2ff2c))
- Wip ([6cc0555](https://github.com/stacksjs/launchpad/commit/6cc0555))
- Wip ([355f702](https://github.com/stacksjs/launchpad/commit/355f702))
- Wip ([e3f0f10](https://github.com/stacksjs/launchpad/commit/e3f0f10))
- Wip ([dd218df](https://github.com/stacksjs/launchpad/commit/dd218df))
- Release v0.1.0 ([692e69e](https://github.com/stacksjs/launchpad/commit/692e69e))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## ...main

### 🏡 Chore

- Initial commit ([2454942](https://github.com/stacksjs/launchpad/commit/2454942))
- Wip ([2672e50](https://github.com/stacksjs/launchpad/commit/2672e50))
- Wip ([ee1a903](https://github.com/stacksjs/launchpad/commit/ee1a903))
- Wip ([eafa093](https://github.com/stacksjs/launchpad/commit/eafa093))
- Wip ([6f8481e](https://github.com/stacksjs/launchpad/commit/6f8481e))
- Wip ([9ae4101](https://github.com/stacksjs/launchpad/commit/9ae4101))
- Wip ([739a132](https://github.com/stacksjs/launchpad/commit/739a132))
- Wip ([6cd4562](https://github.com/stacksjs/launchpad/commit/6cd4562))
- Wip ([3aa13ce](https://github.com/stacksjs/launchpad/commit/3aa13ce))
- Wip ([3489037](https://github.com/stacksjs/launchpad/commit/3489037))
- Wip ([2cb614e](https://github.com/stacksjs/launchpad/commit/2cb614e))
- Wip ([cb97f38](https://github.com/stacksjs/launchpad/commit/cb97f38))
- Wip ([a2acc78](https://github.com/stacksjs/launchpad/commit/a2acc78))
- Wip ([e468832](https://github.com/stacksjs/launchpad/commit/e468832))
- Wip ([9f5f949](https://github.com/stacksjs/launchpad/commit/9f5f949))
- Wip ([f007bcc](https://github.com/stacksjs/launchpad/commit/f007bcc))
- Wip ([215bdc2](https://github.com/stacksjs/launchpad/commit/215bdc2))
- Wip ([472db36](https://github.com/stacksjs/launchpad/commit/472db36))
- Wip ([93bd561](https://github.com/stacksjs/launchpad/commit/93bd561))
- Wip ([c35a57a](https://github.com/stacksjs/launchpad/commit/c35a57a))
- Wip ([d41169b](https://github.com/stacksjs/launchpad/commit/d41169b))
- Wip ([ab78d52](https://github.com/stacksjs/launchpad/commit/ab78d52))
- Wip ([446075d](https://github.com/stacksjs/launchpad/commit/446075d))
- Wip ([64c274e](https://github.com/stacksjs/launchpad/commit/64c274e))
- Wip ([676acc5](https://github.com/stacksjs/launchpad/commit/676acc5))
- Wip ([0650add](https://github.com/stacksjs/launchpad/commit/0650add))
- Wip ([8236d54](https://github.com/stacksjs/launchpad/commit/8236d54))
- Wip ([5dae479](https://github.com/stacksjs/launchpad/commit/5dae479))
- Wip ([c817c31](https://github.com/stacksjs/launchpad/commit/c817c31))
- Wip ([ceb6e27](https://github.com/stacksjs/launchpad/commit/ceb6e27))
- Wip ([accac5b](https://github.com/stacksjs/launchpad/commit/accac5b))
- Wip ([2854042](https://github.com/stacksjs/launchpad/commit/2854042))
- Wip ([228bf73](https://github.com/stacksjs/launchpad/commit/228bf73))
- Wip ([2e58f31](https://github.com/stacksjs/launchpad/commit/2e58f31))
- Wip ([c4de3ca](https://github.com/stacksjs/launchpad/commit/c4de3ca))
- Wip ([329a189](https://github.com/stacksjs/launchpad/commit/329a189))
- Wip ([b8cc5d0](https://github.com/stacksjs/launchpad/commit/b8cc5d0))
- Wip ([0295984](https://github.com/stacksjs/launchpad/commit/0295984))
- Wip ([a59a143](https://github.com/stacksjs/launchpad/commit/a59a143))
- Wip ([d131620](https://github.com/stacksjs/launchpad/commit/d131620))
- Wip ([2d9f2a6](https://github.com/stacksjs/launchpad/commit/2d9f2a6))
- Wip ([67e60a9](https://github.com/stacksjs/launchpad/commit/67e60a9))
- Wip ([7d8c1ec](https://github.com/stacksjs/launchpad/commit/7d8c1ec))
- Wip ([16454de](https://github.com/stacksjs/launchpad/commit/16454de))
- Wip ([a0da66e](https://github.com/stacksjs/launchpad/commit/a0da66e))
- Wip ([4d1a2f2](https://github.com/stacksjs/launchpad/commit/4d1a2f2))
- Wip ([4465e4e](https://github.com/stacksjs/launchpad/commit/4465e4e))
- Wip ([21e9650](https://github.com/stacksjs/launchpad/commit/21e9650))
- Wip ([be93cc0](https://github.com/stacksjs/launchpad/commit/be93cc0))
- Wip ([a5f856e](https://github.com/stacksjs/launchpad/commit/a5f856e))
- Wip ([95e51b9](https://github.com/stacksjs/launchpad/commit/95e51b9))
- Wip ([d1da0b3](https://github.com/stacksjs/launchpad/commit/d1da0b3))
- Wip ([882f80d](https://github.com/stacksjs/launchpad/commit/882f80d))
- Wip ([5a17972](https://github.com/stacksjs/launchpad/commit/5a17972))
- Wip ([0fcc868](https://github.com/stacksjs/launchpad/commit/0fcc868))
- Wip ([ada1bb8](https://github.com/stacksjs/launchpad/commit/ada1bb8))
- Wip ([a1f68a0](https://github.com/stacksjs/launchpad/commit/a1f68a0))
- Wip ([c66fc9f](https://github.com/stacksjs/launchpad/commit/c66fc9f))
- Wip ([409be99](https://github.com/stacksjs/launchpad/commit/409be99))
- Wip ([90c8be1](https://github.com/stacksjs/launchpad/commit/90c8be1))
- Wip ([09133e6](https://github.com/stacksjs/launchpad/commit/09133e6))
- Wip ([6cf71a8](https://github.com/stacksjs/launchpad/commit/6cf71a8))
- Wip ([2b0edeb](https://github.com/stacksjs/launchpad/commit/2b0edeb))
- Wip ([5a467fd](https://github.com/stacksjs/launchpad/commit/5a467fd))
- Wip ([55b5f5f](https://github.com/stacksjs/launchpad/commit/55b5f5f))
- Wip ([d4c0b9d](https://github.com/stacksjs/launchpad/commit/d4c0b9d))
- Wip ([787e77d](https://github.com/stacksjs/launchpad/commit/787e77d))
- Wip ([08d9066](https://github.com/stacksjs/launchpad/commit/08d9066))
- Wip ([2f9debf](https://github.com/stacksjs/launchpad/commit/2f9debf))
- Wip ([c6fb084](https://github.com/stacksjs/launchpad/commit/c6fb084))
- Wip ([8788fbf](https://github.com/stacksjs/launchpad/commit/8788fbf))
- Wip ([dafd112](https://github.com/stacksjs/launchpad/commit/dafd112))
- Wip ([ba8156d](https://github.com/stacksjs/launchpad/commit/ba8156d))
- Wip ([9dc0184](https://github.com/stacksjs/launchpad/commit/9dc0184))
- Wip ([40b724e](https://github.com/stacksjs/launchpad/commit/40b724e))
- Wip ([70fc7da](https://github.com/stacksjs/launchpad/commit/70fc7da))
- Wip ([24a0046](https://github.com/stacksjs/launchpad/commit/24a0046))
- Wip ([dd16800](https://github.com/stacksjs/launchpad/commit/dd16800))
- Wip ([f288102](https://github.com/stacksjs/launchpad/commit/f288102))
- Wip ([06b765f](https://github.com/stacksjs/launchpad/commit/06b765f))
- Wip ([c8d456b](https://github.com/stacksjs/launchpad/commit/c8d456b))
- Wip ([26ca9a3](https://github.com/stacksjs/launchpad/commit/26ca9a3))
- Wip ([90fdbe0](https://github.com/stacksjs/launchpad/commit/90fdbe0))
- Wip ([a9d29c9](https://github.com/stacksjs/launchpad/commit/a9d29c9))
- Wip ([eb2ff2c](https://github.com/stacksjs/launchpad/commit/eb2ff2c))
- Wip ([6cc0555](https://github.com/stacksjs/launchpad/commit/6cc0555))
- Wip ([355f702](https://github.com/stacksjs/launchpad/commit/355f702))
- Wip ([e3f0f10](https://github.com/stacksjs/launchpad/commit/e3f0f10))
- Wip ([dd218df](https://github.com/stacksjs/launchpad/commit/dd218df))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))
