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
// The build-status/log ingestion endpoints are authenticated so outsiders can't
// inject fake status. Builders authenticate with the registry token (same one used
// for publishing). If it isn't set the POSTs just 401 and reporting is silently
// skipped — the build itself is unaffected (reporting is fire-and-forget).
const REPORT_TOKEN = process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN || process.env.PANTRY_BUILD_REPORT_TOKEN || ''
function reportHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (REPORT_TOKEN)
    h.Authorization = `Bearer ${REPORT_TOKEN}`
  return h
}
let HOST = ''
try { HOST = hostname() }
catch { /* ignore */ }

// Classify where this build is running so the dashboard can show a labelled,
// clickable host chip (a GitHub Actions run, a Hetzner build box, or local).
const { HOST_KIND, HOST_URL, HOST_LABEL } = (() => {
  const env = process.env
  if (env.GITHUB_ACTIONS === 'true' && env.GITHUB_RUN_ID) {
    const base = env.GITHUB_SERVER_URL || 'https://github.com'
    const repo = env.GITHUB_REPOSITORY || ''
    return {
      HOST_KIND: 'github',
      HOST_URL: `${base}/${repo}/actions/runs/${env.GITHUB_RUN_ID}`,
      HOST_LABEL: `GitHub Actions${env.RUNNER_OS ? ` (${env.RUNNER_OS})` : ''}`,
    }
  }
  if (/^pantry-build/.test(HOST))
    return { HOST_KIND: 'hetzner', HOST_URL: '', HOST_LABEL: `Hetzner · ${HOST}` }
  return { HOST_KIND: 'local', HOST_URL: '', HOST_LABEL: HOST || 'local' }
})()

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
): Promise<void> {
  if (DISABLED)
    return Promise.resolve()
  const body: Record<string, unknown> = { domain, version, platform, state, host: HOST_LABEL || HOST, hostKind: HOST_KIND, hostUrl: HOST_URL || undefined }
  // Cap payloads so a runaway error/output tail can't bloat the request.
  if (detail?.message)
    body.message = String(detail.message).slice(0, 2000)
  if (detail?.error)
    body.error = String(detail.error).slice(-2000) // keep the TAIL of an error
  // Fire-and-forget by default; never throws. Callers about to process.exit can
  // `await` the returned promise to make sure the event flushes first.
  return fetch(`${STATUS_URL}/api/build-events`, {
    method: 'POST',
    headers: reportHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  }).then(() => {}).catch(() => {})
}

/**
 * Stream a batch of build-output lines to the dashboard so the per-package log
 * panel updates live while a build is in flight. Fire-and-forget; never throws.
 * Lines are capped (count + per-line length) so a noisy build can't bloat the
 * request or the server's ring buffer.
 */
export function reportBuildLog(domain: string, version: string, platform: string, lines: string[]): Promise<void> {
  if (DISABLED || !lines?.length)
    return Promise.resolve()
  const capped = lines.slice(-300).map(l => (l.length > 600 ? `${l.slice(0, 600)}…` : l))
  return fetch(`${STATUS_URL}/api/build-logs`, {
    method: 'POST',
    headers: reportHeaders(),
    body: JSON.stringify({ domain, version, platform, host: HOST, lines: capped }),
    signal: AbortSignal.timeout(5000),
  }).then(() => {}).catch(() => {})
}
