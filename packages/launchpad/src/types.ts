import type { Path } from './path'
import type { Version } from './version'

export interface LaunchpadConfig {
  /** Enable verbose logging (default: false) */
  verbose: boolean
  /** Path where binaries should be installed _(default: /usr/local if writable, ~/.local otherwise)_ */
  installationPath: string
  /** Password for sudo operations, loaded from .env SUDO_PASSWORD _(default: '')_ */
  sudoPassword?: string
  /** Whether to enable dev-aware installations _(default: true)_ */
  devAware: boolean
  /** Whether to auto-elevate with sudo when needed _(default: true)_ */
  autoSudo: boolean
  /** Max installation retries on failure _(default: 3)_ */
  maxRetries: number
  /** Timeout for pkgx operations in milliseconds _(default: 60000)_ */
  timeout: number
  /** Whether to symlink versions _(default: true)_ */
  symlinkVersions: boolean
  /** Whether to force reinstall if already installed _(default: false)_ */
  forceReinstall: boolean
  /** Default path for shims (default: ~/.local/bin) */
  shimPath: string
  /** Whether to automatically add shim path to the system PATH _(default: true)_ */
  autoAddToPath: boolean
  /** Whether to show shell environment activation messages _(default: true)_ */
  showShellMessages: boolean
  /** Custom message to show when environment is activated _(default: "✅ Environment activated for {path}")_ */
  shellActivationMessage: string
  /** Custom message to show when environment is deactivated _(default: "dev environment deactivated")_ */
  shellDeactivationMessage: string
  /** Whether to use a package registry _(default: true)_ */
  useRegistry: boolean
  /** Installation method _(default: 'curl')_ */
  installMethod: 'curl' | 'wget'
  /** Installation path _(default: '')_ */
  installPath: string
}

export type LaunchpadOptions = Partial<LaunchpadConfig>

// Types based on previous implementation
export interface Installation {
  path: Path
  pkg: {
    project: string
    version: Version
  }
}

export interface JsonResponse {
  runtime_env: Record<string, Record<string, string>>
  pkgs: Installation[]
  env: Record<string, Record<string, string>>
  pkg: Installation
}
