/**
 * Desktop App Management for macOS
 *
 * Scans /Applications for installed apps, maps them to Homebrew cask tokens,
 * checks for available updates, and provides update functionality.
 * This gives pantry "app store" capabilities for desktop applications.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'

// ── Types ────────────────────────────────────────────────────────

export interface InstalledApp {
  name: string
  version: string
  path: string
  bundleId?: string
}

export interface AppUpdateInfo {
  name: string
  currentVersion: string
  latestVersion: string | null
  updateAvailable: boolean
  source: 'brew-cask' | 'mas' | 'system' | 'self-updating' | 'unknown'
  caskToken: string | null
  autoUpdates: boolean
}

export interface BrewCaskInfo {
  token: string
  version: string
  autoUpdates: boolean
  appNames: string[]
}

// ── App → Cask Token Mapping ─────────────────────────────────────
// Key: app name as it appears in /Applications (without .app)
// Value: Homebrew cask token

export const APP_CASK_MAP: Record<string, string> = {
  // Browsers
  'Arc': 'arc',
  'Brave Browser': 'brave-browser',
  'Firefox': 'firefox',
  'Google Chrome': 'google-chrome',
  'Microsoft Edge': 'microsoft-edge',
  'Opera': 'opera',
  'Vivaldi': 'vivaldi',
  'Zen Browser': 'zen-browser',
  'Orion': 'orion',
  'Chromium': 'chromium',
  'Tor Browser': 'tor-browser',

  // Development - Editors & IDEs
  'Visual Studio Code': 'visual-studio-code',
  'Cursor': 'cursor',
  'Zed': 'zed',
  'Sublime Text': 'sublime-text',
  'Sublime Merge': 'sublime-merge',
  'Nova': 'nova',
  'BBEdit': 'bbedit',
  'CotEditor': 'coteditor',
  'IntelliJ IDEA': 'intellij-idea',
  'IntelliJ IDEA CE': 'intellij-idea-ce',
  'PhpStorm': 'phpstorm',
  'WebStorm': 'webstorm',
  'PyCharm': 'pycharm',
  'PyCharm CE': 'pycharm-ce',
  'RubyMine': 'rubymine',
  'CLion': 'clion',
  'GoLand': 'goland',
  'DataGrip': 'datagrip',
  'Rider': 'rider',
  'Android Studio': 'android-studio',
  'Fleet': 'jetbrains-fleet',

  // Development - Terminals
  'iTerm': 'iterm2',
  'Ghostty': 'ghostty',
  'Warp': 'warp',
  'Alacritty': 'alacritty',
  'Kitty': 'kitty',
  'Hyper': 'hyper',

  // Development - Tools
  'GitHub Desktop': 'github',
  'GitKraken': 'gitkraken',
  'Tower': 'tower',
  'Fork': 'fork',
  'Tinkerwell': 'tinkerwell',
  'TablePlus': 'tableplus',
  'Sequel Pro': 'sequel-pro',
  'Sequel Ace': 'sequel-ace',
  'Postman': 'postman',
  'Insomnia': 'insomnia',
  'Proxyman': 'proxyman',
  'Docker': 'docker',
  'OrbStack': 'orbstack',
  'Dynobase': 'dynobase',
  'HTTPie': 'httpie',
  'Charles': 'charles',
  'Paw': 'paw',
  'Dash': 'dash',
  'SourceTree': 'sourcetree',

  // Communication
  'WhatsApp': 'whatsapp',
  'Slack': 'slack',
  'Discord': 'discord',
  'Telegram': 'telegram',
  'Microsoft Teams': 'microsoft-teams',
  'Zoom': 'zoom',
  'Signal': 'signal',
  'Skype': 'skype',
  'Lark': 'lark',

  // AI
  'Claude': 'claude',
  'ChatGPT': 'chatgpt',

  // Productivity - Notes & Knowledge
  'Obsidian': 'obsidian',
  'Notion': 'notion',
  'Bear': 'bear',
  'Craft': 'craft',
  'Logseq': 'logseq',
  'Typora': 'typora',
  'Joplin': 'joplin',

  // Productivity - Tasks & Calendar
  'Things3': 'things',
  'Things': 'things',
  'Todoist': 'todoist',
  'TickTick': 'ticktick',
  'Fantastical': 'fantastical',
  'Spark': 'readdle-spark',

  // Productivity - Utilities
  '1Password': '1password',
  '1Password 7': '1password',
  'Raycast': 'raycast',
  'Alfred': 'alfred',
  'BetterTouchTool': 'bettertouchtool',
  'Bartender': 'bartender',
  'Setapp': 'setapp',
  'Grammarly Desktop': 'grammarly-desktop',

  // Media
  'Spotify': 'spotify',
  'IINA': 'iina',
  'VLC': 'vlc',
  'HandBrake': 'handbrake',
  'Kap': 'kap',
  'OBS': 'obs',
  'DaVinci Resolve': 'davinci-resolve',
  'Plex': 'plex',
  'Audacity': 'audacity',
  'Elmedia Player': 'elmedia-player',

  // Design
  'Figma': 'figma',
  'Sketch': 'sketch',
  'Affinity Designer': 'affinity-designer',
  'Affinity Designer 2': 'affinity-designer',
  'Affinity Photo': 'affinity-photo',
  'Affinity Photo 2': 'affinity-photo',
  'Affinity Publisher': 'affinity-publisher',
  'Affinity Publisher 2': 'affinity-publisher',
  'ImageOptim': 'imageoptim',
  'Pixelmator Pro': 'pixelmator-pro',
  'Canva': 'canva',

  // Utilities - System
  'AppCleaner': 'appcleaner',
  'Pearcleaner': 'pearcleaner',
  'CleanMyMac': 'cleanmymac',
  'CleanMyMac X': 'cleanmymac',
  'Caffeine': 'caffeine',
  'KeepingYouAwake': 'keepingyouawake',
  'Muzzle': 'muzzle',
  'Rectangle': 'rectangle',
  'Magnet': 'magnet',
  'MonitorControl': 'monitorcontrol',
  'iStat Menus': 'istat-menus',
  'CleanShot X': 'cleanshot',
  'Shottr': 'shottr',
  'Karabiner-Elements': 'karabiner-elements',
  'Logi Options+': 'logi-options-plus',
  'logioptionsplus': 'logi-options-plus',
  'Logi Options Plus': 'logi-options-plus',

  // Utilities - Files & Transfer
  'Transmit': 'transmit',
  'Cyberduck': 'cyberduck',
  'The Unarchiver': 'the-unarchiver',
  'Keka': 'keka',
  'ForkLift': 'forklift',
  'Mountain Duck': 'mountain-duck',

  // Virtualization
  'Parallels Desktop': 'parallels',
  'VMware Fusion': 'vmware-fusion',
  'UTM': 'utm',

  // Gaming
  'Steam': 'steam',
  'Epic Games Launcher': 'epic-games',

  // VPN & Security
  'Tailscale': 'tailscale',
  'WireGuard': 'wireguard-go',
  'NordVPN': 'nordvpn',
  'Mullvad VPN': 'mullvad-vpn',

  // Database
  'MongoDB Compass': 'mongodb-compass',
  'Redis Insight': 'redisinsight',
  'Robo 3T': 'robo-3t',

  // Other
  'Numi': 'numi',
  'Maccy': 'maccy',
  'Camo': 'camo',
  'Linear': 'linear-linear',
  'Loom': 'loom',
  'Dropbox': 'dropbox',
  'Google Drive': 'google-drive',
  'OneDrive': 'onedrive',
  'MediaInfo': 'mediainfo',
}

// Known system/Apple apps that have no cask
export const SYSTEM_APPS = new Set([
  'Safari',
  'Numbers',
  'Pages',
  'Keynote',
  'GarageBand',
  'iMovie',
  'Color Picker',
  'Simulator',
  'Simulator (Watch)',
  'Preview',
  'TextEdit',
  'Automator',
  'Font Book',
  'Migration Assistant',
  'Photo Booth',
  'System Preferences',
  'System Settings',
  'Disk Utility',
  'Terminal',
  'Activity Monitor',
  'Console',
  'Grapher',
  'Script Editor',
  'Time Machine',
  'Photos',
  'Mail',
  'Calendar',
  'Contacts',
  'Reminders',
  'Notes',
  'Maps',
  'Messages',
  'FaceTime',
  'Books',
  'News',
  'Stocks',
  'Weather',
  'Home',
  'Podcasts',
  'Music',
  'TV',
  'Voice Memos',
  'Freeform',
  'Shortcuts',
  'Chess',
  'Dictionary',
  'Stickies',
  'Image Capture',
  'Xcode',
])

// Known MAS-only apps (available on Mac App Store but not as brew cask)
export const MAS_APPS = new Set([
  'Xcode',
  'Numbers',
  'Pages',
  'Keynote',
  'GarageBand',
  'iMovie',
  'Things3',
  'Grammarly for Safari',
  'AdBlock',
  'HP Smart',
  'Audible',
  'CleanMyMac_5_MAS',
  'Mini Motorways',
  'Snake.io+',
  'Numbers Creator Studio',
])

// ── Utility Functions ────────────────────────────────────────────

/**
 * Compare two version strings. Returns true if `latest` is newer than `current`.
 */
export function isNewerVersion(latest: string, current: string): boolean {
  if (!latest || !current || latest === current) return false
  if (current === '?') return !!latest

  // Normalize: strip build metadata, split on dots
  const normalize = (v: string): number[] =>
    v.replace(/[,+].*/g, '').replace(/-.*$/, '').split('.').map(n => Number.parseInt(n, 10) || 0)

  const a = normalize(latest)
  const b = normalize(current)

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] || 0
    const bv = b[i] || 0
    if (av > bv) return true
    if (av < bv) return false
  }

  return false
}

/**
 * Derive a potential cask token from an app name.
 * Returns null if the name is clearly not a cask candidate.
 */
export function guessCaskToken(appName: string): string | null {
  // Skip names with problematic characters
  if (/[+()_]/.test(appName)) return null
  // Skip very short names
  if (appName.length < 2) return null

  const token = appName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()

  return token || null
}

/**
 * Look up the cask token for an app. Uses the static map first,
 * then falls back to algorithmic derivation.
 */
export function getCaskToken(appName: string): string | null {
  if (APP_CASK_MAP[appName]) return APP_CASK_MAP[appName]
  return guessCaskToken(appName)
}

// ── Core Functions ───────────────────────────────────────────────

/**
 * Scan /Applications for installed apps and read their versions from Info.plist.
 */
export function scanInstalledApps(applicationsDir = '/Applications'): InstalledApp[] {
  const apps: InstalledApp[] = []

  if (!fs.existsSync(applicationsDir)) return apps

  const entries = fs.readdirSync(applicationsDir).filter(e => e.endsWith('.app'))

  for (const entry of entries) {
    const name = entry.replace(/\.app$/, '')
    const appPath = `${applicationsDir}/${entry}`
    let version = '?'
    let bundleId: string | undefined

    try {
      const plistPath = `${appPath}/Contents/Info.plist`
      if (fs.existsSync(plistPath)) {
        const vOut = execSync(
          `/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "${plistPath}" 2>/dev/null`,
          { timeout: 5000, encoding: 'utf-8' },
        ).trim()
        if (vOut) version = vOut

        try {
          bundleId = execSync(
            `/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "${plistPath}" 2>/dev/null`,
            { timeout: 5000, encoding: 'utf-8' },
          ).trim() || undefined
        }
        catch {}
      }
    }
    catch {}

    apps.push({ name, version, path: appPath, bundleId })
  }

  return apps
}

/**
 * Query Homebrew for latest cask versions in batch.
 * Pass an array of cask tokens, returns a map of token → info.
 */
export function queryBrewCaskVersions(tokens: string[]): Map<string, BrewCaskInfo> {
  const result = new Map<string, BrewCaskInfo>()
  if (tokens.length === 0) return result

  // Query in batches of 20 to avoid command-line length limits
  const batchSize = 20
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize)
    try {
      const raw = execSync(
        `brew info --cask --json=v2 ${batch.join(' ')} 2>/dev/null`,
        { timeout: 60000, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
      )

      if (!raw) continue

      const data = JSON.parse(raw)
      for (const cask of (data.casks || [])) {
        const appNames: string[] = []
        for (const artifact of (cask.artifacts || [])) {
          if (artifact.app) {
            for (const app of artifact.app) {
              if (typeof app === 'string') {
                appNames.push(app.replace(/\.app$/, ''))
              }
            }
          }
        }

        result.set(cask.token, {
          token: cask.token,
          version: (cask.version || '').split(',')[0],
          autoUpdates: cask.auto_updates || false,
          appNames,
        })
      }
    }
    catch {
      // If batch fails, try individual tokens
      for (const token of batch) {
        try {
          const raw = execSync(
            `brew info --cask --json=v2 ${token} 2>/dev/null`,
            { timeout: 15000, encoding: 'utf-8' },
          )
          if (!raw) continue
          const data = JSON.parse(raw)
          const cask = data.casks?.[0]
          if (cask) {
            const appNames: string[] = []
            for (const artifact of (cask.artifacts || [])) {
              if (artifact.app) {
                for (const app of artifact.app) {
                  if (typeof app === 'string') {
                    appNames.push(app.replace(/\.app$/, ''))
                  }
                }
              }
            }
            result.set(cask.token, {
              token: cask.token,
              version: (cask.version || '').split(',')[0],
              autoUpdates: cask.auto_updates || false,
              appNames,
            })
          }
        }
        catch {}
      }
    }
  }

  return result
}

/**
 * Check for available updates for installed desktop apps.
 * This is the main function — scans apps, queries brew, compares versions.
 */
export function checkAppUpdates(apps?: InstalledApp[]): AppUpdateInfo[] {
  const installedApps = apps || scanInstalledApps()
  const results: AppUpdateInfo[] = []

  // Collect cask tokens for known apps
  const tokenToApps = new Map<string, InstalledApp[]>()
  const appTokenMap = new Map<string, string>() // app name → token

  for (const app of installedApps) {
    if (SYSTEM_APPS.has(app.name)) continue

    const token = getCaskToken(app.name)
    if (token) {
      appTokenMap.set(app.name, token)
      const existing = tokenToApps.get(token) || []
      existing.push(app)
      tokenToApps.set(token, existing)
    }
  }

  // Batch query brew for all known tokens
  const allTokens = Array.from(tokenToApps.keys())
  const caskVersions = queryBrewCaskVersions(allTokens)

  // Build results
  for (const app of installedApps) {
    const isSystem = SYSTEM_APPS.has(app.name)
    const isMAS = MAS_APPS.has(app.name)
    const token = appTokenMap.get(app.name) || null
    const caskInfo = token ? caskVersions.get(token) : null

    let source: AppUpdateInfo['source'] = 'unknown'
    let latestVersion: string | null = null
    let updateAvailable = false
    let autoUpdates = false

    if (isSystem) {
      source = 'system'
    }
    else if (isMAS) {
      source = 'mas'
    }
    else if (caskInfo) {
      latestVersion = caskInfo.version
      autoUpdates = caskInfo.autoUpdates

      if (autoUpdates) {
        source = 'self-updating'
        // Still check if there's a newer version, even for auto-updating apps
        updateAvailable = isNewerVersion(latestVersion, app.version)
      }
      else {
        source = 'brew-cask'
        updateAvailable = isNewerVersion(latestVersion, app.version)
      }
    }

    results.push({
      name: app.name,
      currentVersion: app.version,
      latestVersion,
      updateAvailable,
      source,
      caskToken: token,
      autoUpdates,
    })
  }

  // Sort: outdated first, then by name
  results.sort((a, b) => {
    if (a.updateAvailable && !b.updateAvailable) return -1
    if (!a.updateAvailable && b.updateAvailable) return 1
    return a.name.localeCompare(b.name)
  })

  return results
}

/**
 * Update a desktop app via Homebrew cask.
 */
export async function updateApp(caskToken: string): Promise<{
  success: boolean
  version?: string
  error?: string
}> {
  try {
    // Try upgrade first (for brew-managed casks)
    try {
      const output = execSync(
        `brew upgrade --cask ${caskToken} 2>&1`,
        { timeout: 120000, encoding: 'utf-8' },
      )

      // Get new version
      const verOutput = execSync(
        `brew info --cask --json=v2 ${caskToken} 2>/dev/null`,
        { timeout: 15000, encoding: 'utf-8' },
      )
      const data = JSON.parse(verOutput)
      const version = data.casks?.[0]?.version?.split(',')?.[0] || 'latest'

      return { success: true, version }
    }
    catch (upgradeErr: any) {
      const errMsg = upgradeErr.stderr?.toString() || upgradeErr.message || ''

      // If not installed via brew, try fresh install
      if (errMsg.includes('not installed') || errMsg.includes('No available')) {
        const output = execSync(
          `brew install --cask ${caskToken} 2>&1`,
          { timeout: 120000, encoding: 'utf-8' },
        )

        const verOutput = execSync(
          `brew info --cask --json=v2 ${caskToken} 2>/dev/null`,
          { timeout: 15000, encoding: 'utf-8' },
        )
        const data = JSON.parse(verOutput)
        const version = data.casks?.[0]?.version?.split(',')?.[0] || 'latest'

        return { success: true, version }
      }

      throw upgradeErr
    }
  }
  catch (err: any) {
    const errMsg = err.stderr?.toString() || err.stdout?.toString() || err.message || 'Update failed'
    return {
      success: false,
      error: errMsg.trim().split('\n').pop() || 'Update failed',
    }
  }
}
