/** Bun's loader supplies native paths on each build host. */
export const azureCrc64SourceFilter: RegExp = /@azure[\\/]storage-common[\\/]dist[\\/]esm[\\/]crc64\.js$/

export function makeCrc64SourcePortable(source: string): string {
  const urlImport = 'import { fileURLToPath } from "node:url";'
  if (!source.includes(urlImport)) throw new Error('Azure CRC64 source no longer has the expected node:url import')
  if (!source.includes('import.meta.url')) throw new Error('Azure CRC64 source no longer contains import.meta.url; review the Action build transform')
  return source
    .replace(urlImport, 'import { fileURLToPath, pathToFileURL } from "node:url";')
    .replaceAll('import.meta.url', 'pathToFileURL(process.argv[1]).href')
}

export function assertPortableActionBundle(bundle: string, workspaceRoot: string): void {
  const normalizedRoot = workspaceRoot.replaceAll('\\', '/')
  const violations = [
    bundle.includes(normalizedRoot) || bundle.includes(JSON.stringify(workspaceRoot).slice(1, -1)) ? `build-host workspace path ${normalizedRoot}` : '',
    bundle.includes(`createRequire("file://${normalizedRoot}`) ? `build-host createRequire URL ${normalizedRoot}` : '',
    bundle.includes(`file://${normalizedRoot}`) ? `build-host file URL ${normalizedRoot}` : '',
    /file:\/\/\/[A-Za-z]:\//.test(bundle) ? 'Windows build-time file URL' : '',
    bundle.includes('file:///Users/') ? 'macOS build-time file URL' : '',
    bundle.includes('file:///home/') ? 'Linux build-time file URL' : '',
  ].filter(Boolean)
  if (violations.length) throw new Error(`Action bundle is not portable: ${violations.join(', ')}`)
}
