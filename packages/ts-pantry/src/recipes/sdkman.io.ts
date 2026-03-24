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
    script: [
      'cd "{{prefix}}"',
      'mkdir -p tmp ext etc var candidates',
      'cp -r * {{prefix}}/',
      'curl -s https://api.sdkman.io/2/candidates/all -o {{prefix}}/var/candidates',
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
      '',
      'cd "{{prefix}}"',
      'chmod +x bin/* src/*',
      'echo $PLATFORM > {{prefix}}/var/platform',
      'echo {{version}} > {{prefix}}/var/version',
    ],
  },
}
