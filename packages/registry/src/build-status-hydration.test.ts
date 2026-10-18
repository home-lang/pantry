import type { S3Client } from './storage/aws-client'
import { expect, it } from 'bun:test'
import { S3RequestError } from './storage/aws-client'
import { BuildStatusStore } from './storage/build-status'

for (const failedKey of ['build-status/status.json', 'build-status/coverage.json']) {
  it(`preserves both snapshots when ${failedKey} cannot hydrate, then permits a healthy retry`, async () => {
    const objects = new Map<string, Buffer>()
    let unavailable = false
    let writes = 0
    const client = {
      async getObjectBuffer(_bucket: string, key: string) {
        if (unavailable && key === failedKey)
          throw new S3RequestError('GET', 503, 'ServiceUnavailable')
        const value = objects.get(key)
        if (!value) throw new S3RequestError('GET', 404, 'NoSuchKey')
        return value
      },
      async putObject(input: { key: string, body: string | Buffer }) {
        writes++
        objects.set(input.key, Buffer.from(input.body))
      },
      async list() {
        return [{ Key: 'binaries/bun.sh/1.2.3/linux-arm64/bun.sh-1.2.3.tar.gz', LastModified: '2026-10-18T00:00:00Z' }]
      },
    } as unknown as S3Client
    const original = new BuildStatusStore(client, 'registry')
    await original.load()
    await original.refreshCoverage(true)
    original.record({ domain: 'bun.sh', version: '1.2.3', platform: 'linux-arm64', state: 'built' })
    await original.flush()
    const status = Buffer.from(objects.get('build-status/status.json')!)
    const coverage = Buffer.from(objects.get('build-status/coverage.json')!)
    const initialWrites = writes

    unavailable = true
    const restarted = new BuildStatusStore(client, 'registry')
    await expect(restarted.load()).rejects.toThrow('503')
    if (failedKey.endsWith('coverage.json')) {
      restarted.record({ domain: 'git-scm.org', version: '2.53.0', platform: 'linux-arm64', state: 'built' })
      await expect(restarted.flush()).rejects.toThrow()
    }
    else {
      await expect(restarted.refreshCoverage(true)).rejects.toThrow()
    }
    expect(writes).toBe(initialWrites)
    expect(objects.get('build-status/status.json')).toEqual(status)
    expect(objects.get('build-status/coverage.json')).toEqual(coverage)

    unavailable = false
    await restarted.load()
    restarted.record({ domain: 'curl.se', version: '8.22.0', platform: 'linux-arm64', state: 'built' })
    await restarted.flush()
    const recovered = JSON.parse(objects.get('build-status/status.json')!.toString())
    expect(recovered.recent.map((event: { domain: string }) => event.domain)).toContain('bun.sh')
    expect(recovered.recent.map((event: { domain: string }) => event.domain)).toContain('curl.se')
  })
}
