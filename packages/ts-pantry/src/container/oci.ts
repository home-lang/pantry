import type { BuiltLayer, OciDescriptor, OciImageConfig, OciManifest } from './types'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { MEDIA_TYPE } from './types'

/** Compute `sha256:<hex>` for a buffer. */
export function digest(data: Uint8Array | Buffer): string {
  return `sha256:${createHash('sha256').update(data).digest('hex')}`
}

/** The hex portion of a `sha256:<hex>` digest. */
export function digestHex(d: string): string {
  return d.startsWith('sha256:') ? d.slice('sha256:'.length) : d
}

/**
 * Create a deterministic, uncompressed tar of a rootfs directory. Uses the
 * system `tar` (always present on the platforms pantry targets) — the same
 * approach the package installer uses for extraction. Numeric owner + sorted
 * names keep the output stable across machines.
 */
export function tarDirectory(rootfsDir: string): Buffer {
  const out = path.join(rootfsDir, '..', `.layer-${process.pid}-${Date.now()}.tar`)
  try {
    // GNU/BSD tar both accept these; `--numeric-owner` avoids host /etc/passwd
    // leaking into the archive. We tar the dir contents (`.`) so paths are
    // rooted at `/` inside the image.
    const args = ['-cf', out, '--numeric-owner', '-C', rootfsDir, '.']
    execFileSync('tar', args, { stdio: 'pipe', maxBuffer: 1024 * 1024 * 512 })
    return fs.readFileSync(out)
  }
  finally {
    if (fs.existsSync(out))
      fs.rmSync(out, { force: true })
  }
}

/**
 * Build a single OCI layer from a rootfs directory: produce the uncompressed
 * tar (→ diffId), gzip it (→ digest), and write the gzipped blob to `blobDir`.
 * Also writes the uncompressed tar next to it (needed for docker-archive).
 */
export function buildLayerFromRootfs(rootfsDir: string, blobDir: string): BuiltLayer & { tarPath: string } {
  const tar = tarDirectory(rootfsDir)
  const diffId = digest(tar)
  const gz = gzipSync(tar, { level: 6 })
  const blobDigest = digest(gz)

  fs.mkdirSync(blobDir, { recursive: true })
  const gzPath = path.join(blobDir, `${digestHex(blobDigest)}.tar.gz`)
  const tarPath = path.join(blobDir, `${digestHex(diffId)}.tar`)
  fs.writeFileSync(gzPath, gz)
  fs.writeFileSync(tarPath, tar)

  return { digest: blobDigest, diffId, size: gz.length, path: gzPath, tarPath }
}

/** Serialize an image config to canonical JSON bytes + its digest. */
export function serializeConfig(config: OciImageConfig): { bytes: Buffer, digest: string } {
  const bytes = Buffer.from(JSON.stringify(config))
  return { bytes, digest: digest(bytes) }
}

/** Build an OCI image manifest referencing the config + layers. */
export function buildManifest(
  configDigest: string,
  configSize: number,
  layers: BuiltLayer[],
): { manifest: OciManifest, bytes: Buffer, digest: string } {
  const layerDescriptors: OciDescriptor[] = layers.map(l => ({
    mediaType: MEDIA_TYPE.layerGzip,
    digest: l.digest,
    size: l.size,
  }))

  const manifest: OciManifest = {
    schemaVersion: 2,
    mediaType: MEDIA_TYPE.manifest,
    config: {
      mediaType: MEDIA_TYPE.config,
      digest: configDigest,
      size: configSize,
    },
    layers: layerDescriptors,
  }

  const bytes = Buffer.from(JSON.stringify(manifest))
  return { manifest, bytes, digest: digest(bytes) }
}

/**
 * Write an OCI image layout directory:
 *   <dir>/oci-layout
 *   <dir>/index.json
 *   <dir>/blobs/sha256/<hex>   (config, layers, manifest)
 */
export function writeOciLayout(
  dir: string,
  manifestBytes: Buffer,
  manifestDigest: string,
  configBytes: Buffer,
  configDigest: string,
  layers: BuiltLayer[],
  tags: string[],
): void {
  const blobs = path.join(dir, 'blobs', 'sha256')
  fs.mkdirSync(blobs, { recursive: true })

  fs.writeFileSync(path.join(dir, 'oci-layout'), `${JSON.stringify({ imageLayoutVersion: '1.0.0' })}\n`)

  // Config + manifest blobs.
  fs.writeFileSync(path.join(blobs, digestHex(configDigest)), configBytes)
  fs.writeFileSync(path.join(blobs, digestHex(manifestDigest)), manifestBytes)
  // Layer blobs (gzipped) — copy from their build location.
  for (const l of layers)
    fs.copyFileSync(l.path, path.join(blobs, digestHex(l.digest)))

  const index = {
    schemaVersion: 2,
    mediaType: MEDIA_TYPE.manifestList,
    manifests: [
      {
        mediaType: MEDIA_TYPE.manifest,
        digest: manifestDigest,
        size: manifestBytes.length,
        annotations: tags.length ? { 'org.opencontainers.image.ref.name': tags[0] } : undefined,
      },
    ],
  }
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index))
}

/**
 * Write a docker-archive tarball (the `docker save` format) at `outPath`:
 *   manifest.json            → [{ Config, RepoTags, Layers }]
 *   <configHex>.json         → image config
 *   <diffIdHex>/layer.tar    → uncompressed layer tar (one per layer)
 *
 * `docker load` and OCI runtimes (podman/containerd) accept this format.
 */
export function writeDockerArchive(
  outPath: string,
  configBytes: Buffer,
  configDigest: string,
  layers: Array<BuiltLayer & { tarPath: string }>,
  tags: string[],
): void {
  const staging = `${outPath}.stage-${process.pid}`
  fs.rmSync(staging, { recursive: true, force: true })
  fs.mkdirSync(staging, { recursive: true })

  try {
    const configFile = `${digestHex(configDigest)}.json`
    fs.writeFileSync(path.join(staging, configFile), configBytes)

    const layerPaths: string[] = []
    for (const l of layers) {
      const layerDir = digestHex(l.diffId)
      fs.mkdirSync(path.join(staging, layerDir), { recursive: true })
      fs.copyFileSync(l.tarPath, path.join(staging, layerDir, 'layer.tar'))
      layerPaths.push(`${layerDir}/layer.tar`)
    }

    const manifest = [
      {
        Config: configFile,
        RepoTags: tags.length ? tags : undefined,
        Layers: layerPaths,
      },
    ]
    fs.writeFileSync(path.join(staging, 'manifest.json'), JSON.stringify(manifest))

    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.rmSync(outPath, { force: true })
    execFileSync('tar', ['-cf', outPath, '-C', staging, '.'], { stdio: 'pipe', maxBuffer: 1024 * 1024 * 512 })
  }
  finally {
    fs.rmSync(staging, { recursive: true, force: true })
  }
}

/** Normalize an `os/arch` platform string into config fields. */
export function platformFields(platform?: string): { os: string, architecture: string } {
  const host = process.arch === 'arm64' ? 'arm64' : process.arch === 'x64' ? 'amd64' : process.arch
  if (!platform)
    return { os: 'linux', architecture: host }
  const [os, arch] = platform.split('/')
  return { os: os || 'linux', architecture: arch || host }
}
