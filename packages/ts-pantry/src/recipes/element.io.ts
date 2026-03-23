import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'element.io',
  name: 'Element',
  description: 'A decentralized, encrypted messaging and collaboration client built on Matrix.',
  homepage: 'https://element.io',
  programs: ['element'],
  platforms: ['darwin/aarch64', 'darwin/x86-64', 'windows/x64'],

  build: {
    script: [
      '# Element downloads as ZIP (universal mac)',
      'UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"',
      'BREW_URL=$(brew info --cask --json=v2 element 2>/dev/null | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.casks[0].url)" 2>/dev/null || true)',
      'if [ -n "$BREW_URL" ]; then',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "$BREW_URL" -o /tmp/element.zip',
      'else',
      '  echo "brew cask info unavailable for element, using fallback"',
      '  curl -fSL -L --retry 3 -H "User-Agent: $UA" "https://packages.element.io/desktop/install/macos/Element.zip" -o /tmp/element.zip',
      'fi',
      'cd /tmp && unzip -qo element.zip',
      'mkdir -p "{{prefix}}"',
      'find /tmp -maxdepth 1 -name "Element*.app" -exec mv {} "{{prefix}}/Element.app" \\;',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../Element.app/Contents/MacOS/Element" "{{prefix}}/bin/element"',
    ],
  },
}
