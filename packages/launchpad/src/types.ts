import type { Path } from './path'
import type { Version } from './version'

export interface LaunchpadConfig {
  /** Enable verbose logging (default: false) */
  verbose: boolean
  /** Path where binaries should be installed (default: /usr/local if writable, ~/.local otherwise) */
  installationPath: string
  /** Password for sudo operations, loaded from .env SUDO_PASSWORD (default: '') */
  sudoPassword: string
  /** Whether to enable dev-aware installations (default: true) */
  devAware: boolean
  /** Whether to auto-elevate with sudo when needed (default: true) */
  autoSudo: boolean
  /** Max installation retries on failure (default: 3) */
  maxRetries: number
  /** Timeout for pkgx operations in milliseconds (default: 60000) */
  timeout: number
  /** Whether to symlink versions (default: true) */
  symlinkVersions: boolean
  /** Whether to force reinstall if already installed (default: false) */
  forceReinstall: boolean
  /** Default path for shims (default: ~/.local/bin) */
  shimPath: string
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
