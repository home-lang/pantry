# Desktop App Management

Pantry can install and manage macOS desktop applications (.app bundles) through the same registry and pipeline used for system packages.

## Quick Start

```bash
# Install a desktop app
pantry install obsidian.md

# Install by alias
pantry install vscode
pantry install discord

# View available desktop apps
curl https://registry.pantry.dev/desktop-apps | jq

# Filter by category
curl https://registry.pantry.dev/desktop-apps?category=Development | jq
```

## Available Apps

### Development
| App | Domain | Install |
|-----|--------|---------|
| Visual Studio Code | `code.visualstudio.com` | `pantry install code.visualstudio.com` |
| Cursor | `cursor.com` | `pantry install cursor.com` |
| Zed | `zed.dev` | `pantry install zed.dev` |
| Ghostty | `ghostty.org` | `pantry install ghostty.org` |
| Warp | `warp.dev` | `pantry install warp.dev` |
| iTerm2 | `iterm2.com` | `pantry install iterm2.com` |
| Docker Desktop | `docker.com/desktop` | `pantry install docker.com/desktop` |
| OrbStack | `orbstack.dev` | `pantry install orbstack.dev` |
| TablePlus | `tableplus.com` | `pantry install tableplus.com` |
| DBeaver | `dbeaver.io` | `pantry install dbeaver.io` |
| Postman | `postman.com` | `pantry install postman.com` |
| Bruno | `bruno.app` | `pantry install bruno.app` |

### Browsers
| App | Domain | Install |
|-----|--------|---------|
| Firefox | `firefox.org` | `pantry install firefox.org` |
| Brave | `brave.com` | `pantry install brave.com` |
| Arc | `arc.net` | `pantry install arc.net` |

### Communication
| App | Domain | Install |
|-----|--------|---------|
| Discord | `discord.com` | `pantry install discord.com` |
| Slack | `slack.com` | `pantry install slack.com` |
| Signal | `signal.org` | `pantry install signal.org` |
| Telegram | `telegram.org` | `pantry install telegram.org` |
| WhatsApp | `whatsapp.com` | `pantry install whatsapp.com` |
| Element | `element.io` | `pantry install element.io` |

### AI
| App | Domain | Install |
|-----|--------|---------|
| Ollama | `ollama.com` | `pantry install ollama.com` |
| LM Studio | `lmstudio.ai` | `pantry install lmstudio.ai` |

### Productivity
| App | Domain | Install |
|-----|--------|---------|
| Obsidian | `obsidian.md` | `pantry install obsidian.md` |
| Notion | `notion.so` | `pantry install notion.so` |
| Linear | `linear.app` | `pantry install linear.app` |
| Raycast | `raycast.com` | `pantry install raycast.com` |

### Security
| App | Domain | Install |
|-----|--------|---------|
| 1Password | `1password.com` | `pantry install 1password.com` |
| Bitwarden | `bitwarden.com` | `pantry install bitwarden.com` |
| KeePassXC | `keepassxc.org` | `pantry install keepassxc.org` |

### Media
| App | Domain | Install |
|-----|--------|---------|
| Spotify | `spotify.com` | `pantry install spotify.com` |
| VLC | `vlc.app` | `pantry install vlc.app` |
| IINA | `iina.io` | `pantry install iina.io` |
| HandBrake | `handbrake.fr` | `pantry install handbrake.fr` |

### Design
| App | Domain | Install |
|-----|--------|---------|
| Figma | `figma.com` | `pantry install figma.com` |
| Inkscape | `inkscape.org` | `pantry install inkscape.org` |
| GIMP | `gimp.org` | `pantry install gimp.org` |
| Blender | `blender.org` | `pantry install blender.org` |

### Utilities
| App | Domain | Install |
|-----|--------|---------|
| Rectangle | `rectangle.app` | `pantry install rectangle.app` |
| Karabiner-Elements | `karabiner-elements.pqrs.org` | `pantry install karabiner-elements.pqrs.org` |
| CleanShot X | `cleanshot.com` | `pantry install cleanshot.com` |
| AltTab | `alttab.app` | `pantry install alttab.app` |
| Stats | `stats.app` | `pantry install stats.app` |
| Maccy | `maccy.app` | `pantry install maccy.app` |
| MonitorControl | `monitorcontrol.app` | `pantry install monitorcontrol.app` |
| Hidden Bar | `hiddenbar.app` | `pantry install hiddenbar.app` |
| MeetingBar | `meetingbar.app` | `pantry install meetingbar.app` |
| Keka | `keka.io` | `pantry install keka.io` |

### Office
| App | Domain | Install |
|-----|--------|---------|
| LibreOffice | `libreoffice.org` | `pantry install libreoffice.org` |

### VPN
| App | Domain | Install |
|-----|--------|---------|
| Tunnelblick | `tunnelblick.net` | `pantry install tunnelblick.net` |

## Registry API

### List all desktop apps
```
GET https://registry.pantry.dev/desktop-apps
```

Returns all desktop apps with current version info from S3:
```json
{
  "apps": [
    {
      "domain": "obsidian.md",
      "label": "Obsidian",
      "desc": "Knowledge base & notes",
      "category": "Productivity",
      "version": "1.7.7",
      "platforms": ["darwin-arm64"]
    }
  ],
  "categories": ["AI", "Browsers", "Communication", ...],
  "total": 50,
  "totalAvailable": 50
}
```

### Filter by category
```
GET https://registry.pantry.dev/desktop-apps?category=Development
```

### Check a specific app
```
GET https://registry.pantry.dev/binaries/obsidian.md/metadata.json
```

## How It Works

Desktop apps flow through the exact same pipeline as system packages:

1. **Recipe** (`packages/ts-pantry/src/recipes/{domain}.ts`) defines build instructions
2. **Package definition** (`packages/ts-pantry/src/packages/*.ts`) defines name, versions, aliases
3. **Build** runs on macOS CI, downloads the DMG/ZIP, extracts the .app, creates a tar.gz
4. **Upload** pushes the tarball + SHA256 + metadata.json to S3
5. **Install** via `pantry install` downloads from S3 and extracts locally

## Adding a New Desktop App

1. Create `packages/ts-pantry/src/recipes/{domain}.ts`:
```typescript
import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'domain.com',
  name: 'App Name',
  description: 'Brief description',
  homepage: 'https://domain.com',
  programs: ['app-name'],
  platforms: ['darwin/aarch64', 'darwin/x86-64'],
  versionSource: {
    type: 'github-releases',
    repo: 'org/repo',
  },
  build: {
    script: [
      'curl -fSL -L "https://example.com/app.dmg" -o /tmp/app.dmg',
      'hdiutil attach /tmp/app.dmg -mountpoint /tmp/app-mount -nobrowse -noverify -quiet',
      'mkdir -p "{{prefix}}"',
      'cp -R "/tmp/app-mount/App.app" "{{prefix}}/App.app"',
      'hdiutil detach /tmp/app-mount -quiet || true',
      'mkdir -p "{{prefix}}/bin"',
      'ln -sf "../App.app/Contents/MacOS/app" "{{prefix}}/bin/app"',
    ],
  },
}
```

2. Create `packages/ts-pantry/src/packages/{domainkey}.ts` with the package definition
},
```

4. Add the domain to `darwinOnlyDomains` in `build-all-packages.ts`

5. Regenerate index: `cd packages/ts-pantry && bun bin/cli.ts generate-index && bun bin/cli.ts generate-aliases`

6. Trigger build: `gh workflow run build-desktop-apps.yml -f packages="domain.com" -f force=true`

## Updates

Desktop apps are rebuilt weekly via the `build-desktop-apps.yml` workflow (Mondays 6am UTC). Version updates in the TS package definitions also trigger builds through the existing `update-packages.yml` pipeline.
