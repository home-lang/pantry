import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sdkman.io',
  name: 'sdkman-init.sh',
  description: 'The SDKMAN! Command Line Interface',
  homepage: 'https://sdkman.io',
  github: 'https://github.com/sdkman/sdkman-cli',
  programs: ['sdkman-init.sh'],
  versionSource: {
    type: 'github-releases',
    repo: 'sdkman/sdkman-cli',
  },
  distributable: {
    url: 'https://github.com/sdkman/sdkman-cli/releases/download/{{version}}/sdkman-cli-{{version}}.zip',
    stripComponents: 1,
  },
  buildDependencies: {
    'curl.se': '*',
  },

  build: {
    // PLATFORM mirrors pkgx's platform/arch-keyed env so `var/platform` is populated.
    env: {
      'darwin/aarch64': { PLATFORM: 'darwinarm64' },
      'darwin/x86-64': { PLATFORM: 'darwinx64' },
      'linux/aarch64': { PLATFORM: 'linuxarm64' },
      'linux/x86-64': { PLATFORM: 'linuxx64' },
    },
    script: [
      // Create the runtime layout inside the install prefix.
      { run: 'mkdir -p tmp ext etc var candidates', 'working-directory': '{{prefix}}' },
      // Copy the extracted source tree (bin/, src/, contrib/) into the prefix.
      // Runs in the default working dir (the extracted, strip-components:1 source root).
      'cp -r * {{prefix}}/',
      // Best-effort cache of the candidate list; plain `curl -s` (no -f) so a
      // transient/offline registry cannot abort the build under `set -e`.
      'curl -s https://api.sdkman.io/2/candidates/all -o {{prefix}}/var/candidates',
      {
        run: [
          'cat << EOF > {{prefix}}/etc/config',
          'sdkman_auto_answer=false',
          'sdkman_auto_complete=true',
          'sdkman_auto_env=false',
          'sdkman_beta_channel=false',
          'sdkman_colour_enable=true',
          'sdkman_curl_connect_timeout=7',
          'sdkman_curl_max_time=10',
          'sdkman_debug_mode=false',
          'sdkman_insecure_ssl=false',
          'sdkman_rosetta2_compatible=false',
          'sdkman_selfupdate_feature=false',
          'EOF',
        ],
      },
      { run: 'chmod +x bin/* src/*', 'working-directory': '{{prefix}}' },
      'echo $PLATFORM > {{prefix}}/var/platform',
      'echo {{version}} > {{prefix}}/var/version',
    ],
  },
}
