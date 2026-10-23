import { InMemoryAnalytics } from '../../src/analytics'
import { InMemoryAuthStorage } from '../../src/auth'
import { createBuildStatusFixture } from '../../src/build-status-test-utils'
import { InMemoryPhpStorage } from '../../src/php'
import { Registry } from '../../src/registry'
import { createServer } from '../../src/server'
import { S3RequestError } from '../../src/storage/aws-client'
import { InMemoryZigStorage } from '../../src/zig'

// Exercise production routes and rendering with deterministic local data.
const port = Number(process.env.UI_TEST_PORT || 4317)
const buildStatus = createBuildStatusFixture()
const registry = new Registry({
  s3Bucket: 'local',
  dynamoTable: 'local',
  baseUrl: `http://127.0.0.1:${port}`,
  npmFallback: false,
  port,
})
await registry.metadata.putVersion('curl.se', '8.12.0', {
  name: 'curl.se',
  version: '8.12.0',
  publishedAt: '2026-01-01T00:00:00.000Z',
  description: 'Transfer data with URLs',
})
const metadata = Buffer.from(JSON.stringify({
  name: 'curl.se',
  description: 'Transfer data with URLs',
  latestVersion: '8.12.0',
  versions: {
    '8.12.0': {
      platforms: {
        'darwin-arm64': { tarball: 'binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz' },
        'linux-x86-64': { tarball: 'binaries/curl.se/8.12.0/linux-x86-64/curl.se-8.12.0.tar.gz' },
      },
    },
  },
}))
const server = createServer(
  registry,
  port,
  new InMemoryAnalytics(),
  new InMemoryZigStorage(),
  {
    async getObject(key: string) {
      if (key === 'binaries/curl.se/metadata.json') return metadata
      throw new S3RequestError('GET', 404, 'NoSuchKey')
    },
  },
  new InMemoryPhpStorage(),
  new InMemoryAuthStorage(),
  undefined,
  undefined,
  buildStatus.store,
)
server.start()
