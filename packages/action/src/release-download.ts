export interface ReleaseDownloadRetryOptions {
  maxAttempts?: number
  retryDelayMs?: number
  sleep?: (milliseconds: number) => Promise<void>
  onRetry?: (message: string) => void
}

const DEFAULT_RELEASE_DOWNLOAD_MAX_ATTEMPTS = 40

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function errorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = Number((error as { status?: unknown }).status)
    if (Number.isFinite(status)) return status
  }

  const match = errorMessage(error).match(/(?:HTTP response|status(?: code)?)[^0-9]*(\d{3})/i)
  return match ? Number(match[1]) : undefined
}

/**
 * Transport failures, which carry a code rather than a status.
 *
 * A connection that drops mid-download is the ordinary way a large asset
 * fails on a shared runner, and it never reaches the status check above: it
 * arrives as `socket hang up` or an `ECONNRESET`, with no HTTP response to
 * read a code from. Without these the retry loop above sees the one failure
 * it cannot recover from as the one failure it must not retry, and a run dies
 * on a dropped socket after `@actions/tool-cache` has already used up its own
 * three attempts.
 *
 * `ts-pantry`'s installer keeps its own `isRetryableNetworkError` for the same
 * job. The two stay separate because this package deliberately also retries a
 * 404 (an asset that is still publishing), which the installer must not.
 */
const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNABORTED',
  'ECONNREFUSED',
  'ECONNRESET',
  'EAI_AGAIN',
  'EHOSTUNREACH',
  'ENETDOWN',
  'ENETUNREACH',
  'ENOTFOUND',
  'EPIPE',
  'ESOCKETTIMEDOUT',
  'ETIMEDOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET',
])

/** `fetch` reports "fetch failed" and hides the real reason in `cause`. */
function errorCodes(error: unknown): string[] {
  const codes: string[] = []
  let current = error
  for (let depth = 0; depth < 5 && typeof current === 'object' && current !== null; depth += 1) {
    const code = (current as { code?: unknown }).code
    if (typeof code === 'string') codes.push(code.toUpperCase())
    current = (current as { cause?: unknown }).cause
  }
  return codes
}

/** The same failures as text, for the transports that only give a message. */
const RETRYABLE_NETWORK_MESSAGE = /socket hang up|socket disconnected|fetch failed|other side closed|premature close|connection (?:closed|reset|refused)|network (?:error|timeout)|terminated|aborted/i

export function isRetryableReleaseDownloadError(error: unknown): boolean {
  const status = errorStatus(error)
  if (status !== undefined)
    return status === 404 || status === 408 || status === 429 || status >= 500

  if (errorCodes(error).some(code => RETRYABLE_NETWORK_CODES.has(code)))
    return true

  const message = errorMessage(error)
  return /not found|rate limit|timed? ?out|temporar|service unavailable/i.test(message)
    || RETRYABLE_NETWORK_MESSAGE.test(message)
}

export async function downloadReleaseAssetReliably<T>(
  label: string,
  download: () => Promise<T>,
  options: ReleaseDownloadRetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_RELEASE_DOWNLOAD_MAX_ATTEMPTS
  const retryDelayMs = options.retryDelayMs ?? 2000
  const sleep = options.sleep ?? (milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)))

  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await download()
    }
    catch (error) {
      lastError = error
      if (!isRetryableReleaseDownloadError(error)) throw error
      if (attempt === maxAttempts) break

      const delay = Math.min(retryDelayMs * 2 ** (attempt - 1), 30000)
      options.onRetry?.(`${label} is not available yet (${errorMessage(error)}); retrying in ${delay}ms`)
      await sleep(delay)
    }
  }

  throw new Error(`${label} remained unavailable after ${maxAttempts} attempts: ${errorMessage(lastError)}`)
}
