/**
 * Native container ("Docker") support for pantry.
 *
 * pantry can parse + build a `Dockerfile` into an OCI image without shelling
 * out to the `docker` daemon. The build context is filtered by a `.freezer`
 * file — pantry's home-themed equivalent of `.dockerignore` (a `.dockerignore`
 * is honored as a fallback for compatibility).
 */

/** A single parsed Dockerfile instruction. */
export interface DockerInstruction {
  /** The instruction keyword, upper-cased (FROM, RUN, COPY, …). */
  instruction: string
  /** The raw argument string following the keyword (after flag extraction). */
  args: string
  /** `--flag=value` options attached to the instruction (e.g. COPY --from). */
  flags: Record<string, string>
  /** 1-based source line where the instruction starts (for diagnostics). */
  line: number
}

/** One build stage (everything from a `FROM` up to the next `FROM`). */
export interface DockerStage {
  /** Stage name from `FROM x AS name`, or undefined for an anonymous stage. */
  name?: string
  /** The base image reference (the `x` in `FROM x`), or `scratch`. */
  baseImage: string
  /** Platform override from `FROM --platform=…`, if any. */
  platform?: string
  /** Index of this stage among all stages (0-based). */
  index: number
  /** Instructions belonging to this stage (excluding the FROM itself). */
  instructions: DockerInstruction[]
}

/** A fully parsed Dockerfile. */
export interface ParsedDockerfile {
  /** Parser directives (e.g. `# syntax=…`) collected from the header. */
  directives: Record<string, string>
  /** `ARG`s declared before the first `FROM` (global build args). */
  globalArgs: DockerInstruction[]
  /** Ordered build stages. */
  stages: DockerStage[]
  /** Every instruction in source order (including FROM rows), for tooling. */
  instructions: DockerInstruction[]
}

/**
 * OCI image config (the `config` blob). Mirrors the subset of the OCI image
 * spec that the builder populates.
 */
export interface OciImageConfig {
  architecture: string
  os: string
  config: {
    User?: string
    ExposedPorts?: Record<string, Record<string, never>>
    Env?: string[]
    Entrypoint?: string[]
    Cmd?: string[]
    Volumes?: Record<string, Record<string, never>>
    WorkingDir?: string
    Labels?: Record<string, string>
    StopSignal?: string
  }
  rootfs: {
    type: 'layers'
    diff_ids: string[]
  }
  history: Array<{
    created?: string
    created_by?: string
    comment?: string
    empty_layer?: boolean
  }>
  created?: string
}

/** A built layer: its uncompressed (diffID) and compressed (digest) identities. */
export interface BuiltLayer {
  /** sha256 of the gzipped tar (the blob digest, `sha256:…`). */
  digest: string
  /** sha256 of the uncompressed tar (the rootfs diff id, `sha256:…`). */
  diffId: string
  /** Size of the gzipped blob in bytes. */
  size: number
  /** Absolute path to the gzipped layer tarball on disk. */
  path: string
}

/** An OCI descriptor (used in manifests/indexes). */
export interface OciDescriptor {
  mediaType: string
  digest: string
  size: number
  platform?: { architecture: string, os: string }
  annotations?: Record<string, string>
}

/** OCI image manifest. */
export interface OciManifest {
  schemaVersion: 2
  mediaType: string
  config: OciDescriptor
  layers: OciDescriptor[]
  annotations?: Record<string, string>
}

/** Options for building an image from a Dockerfile. */
export interface BuildOptions {
  /** Build-context directory (the `.` in `docker build .`). */
  context: string
  /** Path to the Dockerfile (default: `<context>/Dockerfile`). */
  dockerfile?: string
  /** Image tags, e.g. `['myapp:latest']`. */
  tags?: string[]
  /** `--build-arg` values. */
  buildArgs?: Record<string, string>
  /** Target stage name for multi-stage builds. */
  target?: string
  /** Directory to write the docker-archive tarball + OCI layout into. */
  outputDir?: string
  /** Target platform `os/arch` (default: linux/<host-arch>). */
  platform?: string
  /** Suppress step logging. */
  quiet?: boolean
  /**
   * How to run `RUN` steps:
   *  - 'auto'   : chroot on Linux when root, else cwd-in-rootfs (default)
   *  - 'chroot' : force chroot (Linux/root only)
   *  - 'host'   : run with cwd set into the rootfs, no isolation
   *  - 'skip'   : do not execute RUN (declarative builds)
   */
  runMode?: 'auto' | 'chroot' | 'host' | 'skip'
}

/** Result of a build. */
export interface BuildResult {
  /** Final image manifest digest (`sha256:…`). */
  imageId: string
  /** Tags applied. */
  tags: string[]
  /** Path to the docker-archive tarball, if written. */
  archivePath?: string
  /** Path to the OCI layout directory, if written. */
  ociLayoutPath?: string
  /** The image config. */
  config: OciImageConfig
  /** Layers in order. */
  layers: BuiltLayer[]
  /** Serialized config blob (for pushing without re-reading from disk). */
  configBytes: Uint8Array
  /** Config blob digest `sha256:…`. */
  configDigest: string
  /** Serialized manifest blob. */
  manifestBytes: Uint8Array
  /** Manifest media type. */
  manifestMediaType: string
}

/** A parsed image reference (registry/repository:tag@digest). */
export interface ImageReference {
  /** Registry host, e.g. `registry-1.docker.io` or the pantry registry. */
  registry: string
  /** Repository path, e.g. `library/alpine` or `oven/bun`. */
  repository: string
  /** Tag, e.g. `latest` (mutually informative with digest). */
  tag: string
  /** Digest pin `sha256:…`, if the ref was pinned. */
  digest?: string
  /** True when the registry was implicit (no host in the original ref). */
  implicitRegistry: boolean
}

export const MEDIA_TYPE = {
  manifest: 'application/vnd.oci.image.manifest.v1+json',
  manifestList: 'application/vnd.oci.image.index.v1+json',
  config: 'application/vnd.oci.image.config.v1+json',
  layerGzip: 'application/vnd.oci.image.layer.v1.tar+gzip',
  // Docker (schema 2) equivalents — registries may serve either.
  dockerManifest: 'application/vnd.docker.distribution.manifest.v2+json',
  dockerManifestList: 'application/vnd.docker.distribution.manifest.list.v2+json',
  dockerConfig: 'application/vnd.docker.container.image.v1+json',
  dockerLayerGzip: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
} as const
