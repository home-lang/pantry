import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "apple.com/remote_cmds",
  name: "remote_cmds",
  programs: [
    "telnet",
  ],
  buildDependencies: {
    'curl.se': "*",
  },
  distributable: {
    url: "https://github.com/apple-oss-distributions/remote_cmds/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "curl -L 'https://github.com/apple-oss-distributions/libtelnet/archive/refs/tags/libtelnet-13.tar.gz' | tar -xz --strip-components=1\n\nxcodebuild \\\n  OBJROOT=build/Intermediates \\\n  SYMROOT=build/Products \\\n  DSTROOT=build/Archive \\\n  -IDEBuildLocationStyle=Custom \\\n  -IDECustomDerivedDataLocation=$SRCROOT \\\n  -arch $(uname -m)\n\ncp build/Products/Release/libtelnet.a ./\ncp -r build/Products/Release/usr/local/include/libtelnet ./\n",
        'working-directory': "libtelnet",
      },
      "xcodebuild \\\n  OBJROOT=build/Intermediates \\\n  SYMROOT=build/Products \\\n  DSTROOT=build/Archive \\\n  OTHER_CFLAGS=\"${inherited} $CFLAGS -I$SRCROOT/libtelnet\" \\\n  OTHER_LDFLAGS=\"${inherited} $LDFLAGS -L$SRCROOT/libtelnet\" \\\n  -IDEBuildLocationStyle=Custom \\\n  -IDECustomDerivedDataLocation=$SRCROOT \\\n  -sdk macosx \\\n  -arch $(uname -m) \\\n  -target telnet\n",
      "install -D build/Products/Release/telnet {{prefix}}/bin/telnet",
    ],
  },
  test: {
    script: [
      "server=pkgx.dev",
      "port=80",
      "(echo -e \"GET / HTTP/1.1\\nHost: $server\\n\\n\"; sleep 1; echo \"quit\") | telnet $server $port > response.txt || true\n",
      "cat response.txt | grep '301 Moved Permanently'",
    ],
  },
}
