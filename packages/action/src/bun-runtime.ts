import * as fs from 'node:fs'
import * as path from 'node:path'

export interface BunRuntimeSetup {
  /** Installs `bun.sh` into the pantry directory; rejects when it cannot. */
  install: () => Promise<void>
  /** `pantry/.bin`, where the installer links the `bun` executable. */
  binDir: string
  /** Called with the pantry directory once `bun` is linked (sets BUN_INSTALL). */
  onLinked?: () => void
}

/**
 * Provide the Bun runtime the action promises even with `install: false`.
 *
 * Bun is a REQUIRED part of that contract, so a failed install has to fail
 * the setup step right here, carrying the download error. Downgrading it to a
 * warning reported a successful setup and deferred the failure to whatever
 * step next ran `bun`, as an unrelated `bun: command not found` (#234).
 *
 * Pantry owns the activation of both programs. In particular, `bun` can be
 * a launcher that restores its provider environment. Linking `bunx` to that
 * launcher loses its executor arguments and runs `bun <package>` instead.
 */
export async function setupBunRuntime({ install, binDir, onLinked }: BunRuntimeSetup): Promise<void> {
  try {
    await install()
  }
  catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`Required runtime bun.sh failed to install: ${detail}`)
  }

  const bunPath = path.join(binDir, 'bun')
  if (!fs.existsSync(bunPath)) return

  onLinked?.()
}
