import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dir, '../../..')

function source(path: string): string {
  return readFileSync(resolve(root, path), 'utf8')
}

describe('first-party publication boundaries', () => {
  it('keeps native publishers behind the scan-before-promote API', () => {
    const centralUploader = source('packages/ts-pantry/scripts/upload-to-s3.ts')
    const client = source('packages/ts-pantry/scripts/binary-publish-client.ts')
    const zigPublisher = source('packages/zig/src/cli/commands/publish_binary.zig')
    const phpBundler = source('packages/ts-pantry/scripts/bundle-php.sh')
    const pkgxFallback = source('packages/registry/src/pkgx-fallback.ts')

    expect(centralUploader).not.toContain('createObjectStorageClient')
    expect(centralUploader).not.toContain('.putObject(')
    expect(centralUploader).toContain('publishBinaryArtifact')
    expect(client).toContain('/api/v1/binaries/uploads')
    expect(client).toContain('/api/v1/binaries/uploads/complete')
    expect(zigPublisher).not.toContain('aws s3')
    expect(zigPublisher).toContain('/api/v1/binaries/uploads')
    expect(phpBundler).not.toContain('aws s3 cp')
    expect(phpBundler).toContain('scripts/upload-to-s3.ts')
    expect(pkgxFallback).not.toContain('s3.putObject')
    expect(pkgxFallback).not.toContain('await res.arrayBuffer()')
    expect(pkgxFallback).not.toContain('readFileSync(gzPath)')
    expect(pkgxFallback).toContain('publisher.initiate')
    expect(pkgxFallback).toContain('publisher.complete')
  })

  it('keeps the legacy core publisher behind the authenticated API', () => {
    const legacyPublisher = source('packages/registry/app/publish.ts')
    expect(legacyPublisher).not.toContain('S3Client')
    expect(legacyPublisher).not.toContain('DynamoDBClient')
    expect(legacyPublisher).toContain('fetch(`${registryUrl}/publish`')
  })

  it('enforces staging cleanup and registry-only installable writes in CloudFormation', () => {
    const template = source('packages/registry/infrastructure/cloudformation.yml')
    expect(template).toContain('ExpireAbandonedMalwareStaging')
    expect(template).toContain('ExpireAbandonedSealedArtifacts')
    expect(template).toContain('DenyNonRegistryInstallableWrites')
    expect(template).toContain('${PackagesBucket.Arn}/binaries/*')
    expect(template).toContain('aws:PrincipalArn: !GetAtt RegistryRole.Arn')
  })

  it('deploys the exact bundle only after scanner readiness is proven', () => {
    const workflow = source('.github/workflows/deploy-registry.yml')
    const packageJson = source('packages/registry/package.json')
    expect(workflow).toContain("EXPECTED_SHA=\"$5\"")
    expect(workflow).toContain('NODE_ENV=production "$BUN" run build:server')
    expect(packageJson).toContain('./src/scanner-worker.ts --outfile ./dist/scanner-worker.js')
    expect(workflow).toContain('CacheDirectory=pantry-registry-zig')
    expect(workflow).toContain('CacheDirectoryMode=0700')
    expect(workflow).toContain('set_env PANTRY_ZIG_CACHE_DIR /var/cache/pantry-registry-zig')
    expect(workflow).toContain('set_env PANTRY_MALWARE_SCANNING required')
    expect(workflow).toContain('set_env CLAMD_SOCKET /run/clamav/clamd.ctl')
    expect(workflow).toContain('set_env CLAMD_TIMEOUT_MS 240000')
    expect(workflow).toContain('set_env CLAMD_HEALTH_TIMEOUT_MS 5000')
    expect(workflow).toContain('set_env PANTRY_HTTP_IDLE_TIMEOUT_SECONDS 255')
    expect(workflow).toContain('Environment=RPX_UPSTREAM_TIMEOUT=300')
    expect(workflow).toContain("vars.PANTRY_REQUIRE_BINARY_SCAN_ATTESTATION || 'false'")
    expect(workflow).toContain("vars.PANTRY_LEGACY_SCAN_ATTESTATION_CUTOFF || ''")
    expect(workflow).toContain('set_env PANTRY_SCANNER_SYSTEMD_ISOLATION true')
    expect(workflow).toContain('set_env PANTRY_SCANNER_WORKER_MEMORY_MAX 1G')
    // Disk-backed, and forwarded into the isolated unit. The worker stages the
    // artifact so a coverage-limited archive can be re-read member by member;
    // on a tmpfs /tmp that file counts against MemoryMax and kills the worker.
    expect(workflow).toContain('set_env PANTRY_SCANNER_SCRATCH_DIR /opt/pantry-registry/scan-scratch')
    expect(workflow).toContain('install -d -m 700 /opt/pantry-registry/scan-scratch')
    expect(workflow).toContain('command -v systemd-run')
    // These move with DEFAULT_MAX_CONCURRENT_ISOLATED_SCANS or not at all:
    // extra worker slots against clamd's old two threads only relocate the
    // queue, where the wait surfaces as a timeout instead of as throughput.
    expect(workflow).toContain('set_clam MaxThreads 4')
    expect(workflow).toContain('set_clam MaxQueue 8')
    // Must be at least Registry's largest per-artifact budget. Below it, the
    // engine aborts scans Registry is still waiting for - which is exactly
    // what capped the 183MB vitess package at 225s of engine time.
    expect(workflow).toContain('set_clam MaxScanTime 2700000')
    expect(workflow).toContain('set_clam MaxScanSize 8G')
    expect(workflow).toContain('set_clam MaxFileSize 2G')
    expect(workflow).toContain('set_clam AlertExceedsMax yes')
    // Production must not be stricter than the backfill's clamd, which scans
    // the same artifacts. At 100000 the publish path reported
    // Heuristics.Limits.Exceeded.MaxFiles for solr.apache.org and neo4j.com —
    // a fail-closed non-verdict, retried every sweep since June.
    expect(workflow).toContain('set_clam MaxFiles 1000000')
    // These three move together or not at all. The scanner refusing what the
    // publish path accepts is a fail-closed rejection of packages we already
    // serve — flutter.dev is 2140 MB and llvm.org 1714 MB, both published long
    // before the 1 GiB cap started refusing their newer versions.
    expect(workflow).toContain('set_env CLAMD_MAX_BYTES 4294967296')
    expect(workflow).toContain('set_clam StreamMaxLength 2G')
    expect(workflow).toContain('set_clam ConcurrentDatabaseReload no')
    expect(workflow).toContain("LEGACY_RESCAN_MAX_BYTES: ${{ vars.PANTRY_LEGACY_RESCAN_MAX_BYTES || '8589934592' }}")
    expect(workflow).toContain('LEGACY_RESCAN_MAX_BYTES="$8"')
    expect(workflow).toContain('set_env PANTRY_LEGACY_RESCAN_MAX_BYTES "$LEGACY_RESCAN_MAX_BYTES"')
    expect(workflow).toContain("sed -i '/^PANTRY_LEGACY_RESCAN_MAX_BYTES=/d'")
    expect(workflow).toContain('clamav-daemon clamav-freshclam jq util-linux')
    expect(workflow).toContain('clamav-daemon.service.d')
    expect(workflow).toContain("'Nice=10'")
    // batch, never idle: SCHED_IDLE starves a large scan and voids Nice and
    // CPUWeight, which are CFS controls that do not apply to it.
    expect(workflow).toContain("'CPUSchedulingPolicy=batch'")
    expect(workflow).not.toContain("'CPUSchedulingPolicy=idle'")
    expect(workflow).toContain("'CPUWeight=25'")
    expect(workflow).toContain("'IOSchedulingClass=idle'")
    expect(workflow).toContain("'IOWeight=25'")
    expect(workflow).toContain("'MemoryHigh=55%'")
    expect(workflow).toContain("'MemoryMax=65%'")
    expect(workflow).toContain("'MemorySwapMax=0'")
    expect(workflow).toContain("'OOMScoreAdjust=250'")
    expect(workflow).toContain("printf 'CPUAffinity=1-%s")
    expect(workflow).toContain('systemctl show clamav-daemon --property=CPUAffinity --value')
    expect(workflow).toContain('systemctl show clamav-daemon --property=MemoryMax --value')
    expect(workflow).toContain('systemctl show clamav-daemon --property=MemorySwapMax --value')
    expect(workflow).toContain('systemctl restart clamav-daemon')
    expect(workflow).toContain("ExecCondition=/bin/sh -c '! systemctl is-active --quiet apt-daily-upgrade.service'")
    // The recovery unit restarts BOTH services and reports the outcome. An
    // earlier version only restarted the registry and exited silently, so a
    // wedged clamd stayed wedged and the timer reported success either way.
    expect(workflow).toContain('systemctl restart clamav-daemon.service; systemctl restart ${SERVICE}.service')
    expect(workflow).toContain('[recover] STILL UNHEALTHY after restart')
    // Must exit non-zero when recovery fails, or the failure is invisible.
    expect(workflow).toContain('needs a human\\"; exit 1')
    expect(workflow).toContain('http://127.0.0.1:${PORT}/health')
    expect(workflow).not.toContain('is-active --quiet unattended-upgrades.service')
    expect(workflow).toContain('${SERVICE}-recovery.timer')
    expect(workflow).toContain('${REGISTRY_URL}/ready')
    expect(workflow).toContain('.malwareScanning.required == true')
    expect(workflow).toContain('.malwareScanning.ready == true')
    expect(workflow).toContain('.code == "MALWARE_DETECTED"')
    expect(workflow).toContain('.scan.verdict == "blocked"')
    expect(workflow).toContain('/api/v1/binaries/uploads/complete')
    expect(workflow).toContain('Isolated EICAR binary rehearsal failed')
    expect(workflow).toContain('rehearse_scanner_outage:')
    expect(workflow).toContain('.code == "MALWARE_SCAN_UNAVAILABLE"')
    expect(workflow).toContain('.retryable == true')
    expect(workflow).toContain('Scanner outage rehearsal left an installable artifact')
    expect(workflow).toContain('Scanner outage rehearsal: retryable 503, zero writes, recovered')
  })

  it('keeps the desktop discovery pass from rewriting the manifest it reads', () => {
    // --print-selected is the cheap ubuntu job that decides whether to allocate
    // a macOS runner. It fell through to writeFileSync, so a run whose upstream
    // lookups failed (no token, rate limit) recorded `latest: null` for every
    // app — and a manifest of nulls compares as "everything current", freezing
    // desktop updates silently. The `record` job writes it deliberately.
    const script = source('packages/ts-pantry/scripts/check-desktop-updates.ts')
    expect(script).toContain('--print-selected is a query')
    expect(script).toContain('if (printSelected) {')
    expect(script).toContain('bun scripts/check-desktop-updates.ts --require-current --commit')
  })

  it('bounds retained-artifact backfill scans and closes every HTTP connection', () => {
    const workflow = source('.github/workflows/backfill-malware-scans.yml')
    const backfill = source('packages/ts-pantry/scripts/backfill-malware-scans.ts')
    const binaryPublishing = source('packages/registry/src/binary-publishing.ts')
    const setupClamav = source('.github/actions/setup-clamav/action.yml')
    expect(workflow).toContain('DOMAIN_SHARD_COUNT=32')
    expect(workflow).toContain('ARTIFACT_SHARD_COUNT=8')
    expect(workflow).toContain('--artifact-shard "${SHARDS#*:}"')
    expect(workflow).toContain("default: '4'")
    expect(workflow).toContain("max-parallel: ${{ fromJSON(inputs.max_parallel) }}")
    expect(workflow).toContain("- '16'")
    expect(workflow.match(/PANTRY_BACKFILL_SCAN_CONCURRENCY: '1'/g)).toHaveLength(2)
    expect(workflow).toContain('PANTRY_BACKFILL_EXTERNAL_SCANNER:')
    expect(workflow).toContain('PANTRY_BACKFILL_CLAMD_SOCKET: /run/clamav/clamd.ctl')
    expect(workflow.match(/uses: \.\/\.github\/actions\/setup-clamav/g)).toHaveLength(2)
    expect(setupClamav).toContain('set_clam LocalSocket /run/clamav/clamd.ctl')
    expect(setupClamav).toContain('key: pantry-clamav-${{ runner.os }}-${{ github.run_id }}')
    expect(setupClamav).toContain('--ping 30:2')
    expect(setupClamav).toContain('probe_file=$(mktemp)')
    expect(setupClamav).toContain('PANTRY_BACKFILL_CLAMAV_VERSION=')
    expect(setupClamav).toContain('set_clam StreamMaxLength 2G')
    expect(setupClamav).toContain('set_clam MaxScanSize 8G')
    expect(setupClamav).toContain('set_clam MaxFileSize 2G')
    expect(setupClamav).toContain('set_clam AlertExceedsMax yes')
    expect(setupClamav).toContain('set_clam MaxRecursion 30')
    expect(setupClamav).toContain('set_clam MaxFiles 1000000')
    expect(setupClamav).toContain('set_clam MaxThreads 2')
    expect(setupClamav).toContain('set_clam MaxScanTime 1800000')
    expect(backfill).toContain('timeoutMs: 35 * 60_000')
    expect(backfill).toContain('const ARTIFACT_CONCURRENCY = resolveArtifactConcurrency()')
    expect(backfill).toContain('socketPath: process.env.PANTRY_BACKFILL_CLAMD_SOCKET')
    expect(backfill).toContain('const health = await externalScanner.health()')
    expect(backfill).toContain('process.env.PANTRY_BACKFILL_CLAMAV_VERSION')
    expect(backfill).toContain('maxBytes: 8 * 1024 * 1024 * 1024')
    expect(backfill).toContain('MAX_OVERSIZED_ARCHIVE_ENTRIES = 1_000_000')
    expect(backfill).toContain('scanner coverage limit exceeded: Heuristics.Limits.Exceeded.')
    expect(backfill).toContain('retrying incomplete whole-archive coverage with archive-entry scanning')
    expect(backfill).toContain('ARTIFACT_DOWNLOAD_ATTEMPTS = 5')
    expect(backfill).toContain('transient artifact download failure')
    expect(binaryPublishing).toContain('EXTERNAL_SCAN_MAX_DURATION_MS = 6 * 60 * 60_000')
    expect(binaryPublishing).toContain('EXTERNAL_SCAN_SUBMISSION_GRACE_MS = 15 * 60_000')
    expect(binaryPublishing).toContain('durationMs > ageMs + EXTERNAL_SCAN_CLOCK_SKEW_MS')
    expect(backfill).toContain('scanOversizedGzipTar')
    expect(backfill).toContain('external ClamAV did not report engine and database versions')
    expect(backfill).toContain("'/api/v1/binaries/rescan/prepare'")
    expect(backfill).toContain("'/api/v1/binaries/rescan/attest'")
    expect(backfill).toContain("'Connection: close'")
  })

  it('keeps CLI provisioning within the registry host resource budget', () => {
    const setup = source('packages/zig/src/cli/commands/registry_ops.zig')
    expect(setup).toContain('set_clam MaxThreads 4')
    expect(setup).toContain('set_clam MaxQueue 8')
    expect(setup).toContain('set_clam MaxScanTime 2700000')
    // Kept in step with deploy-registry.yml — the two provision the same box.
    expect(setup).toContain('set_clam MaxFiles 1000000')
    expect(setup).toContain('set_env CLAMD_MAX_BYTES 4294967296')
    expect(setup).toContain('set_clam StreamMaxLength 2G')
    expect(setup).toContain('set_clam ConcurrentDatabaseReload no')
    expect(setup).toContain('clamav-daemon clamav-freshclam util-linux')
    expect(setup).toContain('clamav-daemon.service.d')
    expect(setup).toContain('Nice=10')
    expect(setup).toContain('CPUSchedulingPolicy=batch')
    expect(setup).toContain('CPUWeight=25')
    expect(setup).toContain('IOSchedulingClass=idle')
    expect(setup).toContain('IOWeight=25')
    expect(setup).toContain('MemoryHigh=55%')
    expect(setup).toContain('MemoryMax=65%')
    expect(setup).toContain('MemorySwapMax=0')
    expect(setup).toContain('OOMScoreAdjust=250')
    expect(setup).toContain("printf 'CPUAffinity=1-%s")
    expect(setup).toContain('systemctl show clamav-daemon --property=CPUAffinity --value')
    expect(setup).toContain('systemctl show clamav-daemon --property=MemoryMax --value')
    expect(setup).toContain('systemctl show clamav-daemon --property=MemorySwapMax --value')
    expect(setup).toContain('set_env CLAMD_TIMEOUT_MS 240000')
    expect(setup).toContain('set_env CLAMD_HEALTH_TIMEOUT_MS 5000')
    expect(setup).toContain('set_env PANTRY_HTTP_IDLE_TIMEOUT_SECONDS 255')
    expect(setup).toContain('set_env PANTRY_SCANNER_SYSTEMD_ISOLATION true')
    expect(setup).toContain('set_env PANTRY_SCANNER_WORKER_MEMORY_MAX 1G')
    expect(setup).toContain('set_env PANTRY_SCANNER_SCRATCH_DIR /opt/pantry-registry/scan-scratch')
    expect(setup).toContain('command -v systemd-run')
  })
})
