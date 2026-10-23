import * as core from '@actions/core'
import { removeAppleSigningKeychain } from './apple-signing'
import type { NativeServiceState } from './native-services'
import { stopNativeService } from './native-services'
import { buildArchiveCacheSummary } from './build-archive-cache-summary'
import { homedir } from 'node:os'
import { join } from 'node:path'

async function reportArchiveTraffic(): Promise<void> {
  if (core.getState('build-archive-cache-summary') !== 'true') return
  const directory = process.env.PANTRY_BUILD_ARCHIVE_CACHE_DIR || join(process.env.GITHUB_WORKSPACE || homedir(), '.cache', 'pantry-build-archives', 'v1')
  const summary = await buildArchiveCacheSummary(directory)
  if (summary) await core.summary.addRaw(summary).write()
}

async function stopNativeServices(): Promise<void> {
  const records: NativeServiceState[] = JSON.parse(core.getState('native-services') || '[]')
  for (const service of records.reverse()) {
    await stopNativeService(service).catch(error => core.setFailed(error instanceof Error ? error.message : String(error)))
  }
}

async function removeSigningKeychain(): Promise<void> {
  const keychainPath = core.getState('apple-signing-keychain')
  if (!keychainPath) return
  await removeAppleSigningKeychain(keychainPath)
  core.info('Removed Apple signing keychain')
}

async function cleanup(): Promise<void> {
  // Each step is independent — failing to stop a service must not leave the signing
  // certificates behind on the runner.
  for (const step of [stopNativeServices, removeSigningKeychain, reportArchiveTraffic])
    await step().catch(error => core.setFailed(error instanceof Error ? error.message : String(error)))
}

cleanup().catch(error => core.setFailed(error instanceof Error ? error.message : String(error)))
