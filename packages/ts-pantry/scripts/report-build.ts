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

export interface BuildReportDetail {
  /** Progress step for a `building` event (e.g. "downloading", "compiling"). */
  message?: string
  /** Failure detail for a `failed` event (error message / output tail). */
  error?: string
}

export function reportBuild(
  domain: string,
  version: string,
  platform: string,
  state: BuildState,
  detail?: BuildReportDetail,
): void {
  if (DISABLED)
    return
  const body: Record<string, unknown> = { domain, version, platform, state, host: HOST }
  // Cap payloads so a runaway error/output tail can't bloat the request.
  if (detail?.message)
    body.message = String(detail.message).slice(0, 2000)
  if (detail?.error)
    body.error = String(detail.error).slice(-2000) // keep the TAIL of an error
  // Fire-and-forget; never block or throw.
  fetch(`${STATUS_URL}/api/build-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {})
}
