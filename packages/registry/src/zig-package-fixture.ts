import { gzipSync } from 'node:zlib'
import { pack } from 'tar-stream'

export async function zigPackageFixture(version = '1.0.0', excluded = '', value = 42): Promise<Buffer> {
  const archive = pack()
  archive.entry({ name: 'package/build.zig.zon', mode: 0o644, mtime: new Date(0) }, `.{ .name = .graphics_package_consumer, .version = "${version}", .fingerprint = 0xab1f9a8fd4d75f78, .paths = .{ "build.zig.zon", "src" } }\n`)
  archive.entry({ name: 'package/src/main.zig', mode: 0o644, mtime: new Date(0) }, `pub const value: u32 = ${value};\n`)
  if (excluded) archive.entry({ name: 'package/unshipped.txt', mode: 0o644, mtime: new Date(0) }, excluded)
  archive.finalize()
  const chunks: Buffer[] = []
  for await (const chunk of archive) chunks.push(Buffer.from(chunk))
  return gzipSync(Buffer.concat(chunks))
}

