// Best-effort build-status reporting to the registry's build dashboard.
//
// Called by build-all-packages.ts at building/built/failed transitions so the
// pantry.dev /packages page can show live build activity across CI, the Hetzner
// driver, and local Mac builds alike. Failures here NEVER affect a build:
// network errors are swallowed and reporting can be turned off with
// PANTRY_BUILD_REPORT=0. The endpoint is overridable via REGISTRY_STATUS_URL.
import { hostname } from 'node:os'

const STATUS_URL = (process.env.REGISTRY_STATUS_URL || 'https://registry.pantry.dev').replace(/\/$/, '')
const DISABLED = process.env.PANTRY_BUILD_REPORT === '0'
let HOST = ''
try { HOST = hostname() }
catch { /* ignore */ }

export type BuildState = 'building' | 'built' | 'failed'

export function reportBuild(domain: string, version: string, platform: string, state: BuildState): void {
  if (DISABLED)
    return
  // Fire-and-forget; never block or throw.
  fetch(`${STATUS_URL}/api/build-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, version, platform, state, host: HOST }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {})
}
