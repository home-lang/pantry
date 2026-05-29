/**
 * Native container ("Docker") support for pantry — no Docker daemon required.
 *
 *  - parse & build a `Dockerfile` into an OCI image (docker-archive + OCI layout)
 *  - filter the build context with `.freezer` (pantry's `.dockerignore`)
 *  - pull base images (pantry registry first, then Docker Hub)
 *  - push built images to the pantry registry
 *  - generate a Dockerfile + `.freezer` for a project
 */
export { buildImage } from './builder'
export { collectBuildContext } from './context'
export type { ContextEntry } from './context'
export { parseDockerfile, parseExecForm, resolveBuildStages } from './dockerfile'
export { createMatcher, loadFreezer, parseFreezer } from './freezerignore'
export type { FreezerMatcher, FreezerRule } from './freezerignore'
export { generateContainerFiles, renderDockerfile } from './generate'
export type { GenerateOptions, GenerateResult } from './generate'
export {
  buildLayerFromRootfs,
  buildManifest,
  digest,
  digestHex,
  serializeConfig,
  writeDockerArchive,
  writeOciLayout,
} from './oci'
export {
  extractLayer,
  PANTRY_REGISTRY,
  parseImageRef,
  pullImage,
  pushImage,
  verifyBlob,
} from './registry'
export type { PulledImage } from './registry'
export * from './types'
