import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateZigAliases } from '../src/generate-zig'

const zig = process.env.PANTRY_ZIG_TEST_BIN || Bun.which('zig')
test.skipIf(!zig)('regenerated aliases compile against the native registry API', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry native aliases '))
  try {
    const packages = join(root, 'packages')
    mkdirSync(packages)
    writeFileSync(join(packages, 'node.ts'), 'export const nodePackage = { domain: "nodejs.org", name: "node", programs: ["node"], aliases: ["nodejs"] }')
    const aliases = join(root, 'aliases.zig')
    await generateZigAliases(packages, aliases)
    const main = join(root, 'main.zig')
    writeFileSync(main, `const std = @import("std");
const aliases = @import("aliases");
test "native registry contract" {
    try std.testing.expectEqualStrings("nodejs.org", aliases.resolveAlias("node") orelse return error.MissingAlias);
    try std.testing.expectEqualStrings("nodejs.org", aliases.resolveAlias("nodejs") orelse return error.MissingAlias);
    try std.testing.expect(aliases.resolveAlias("__pantry_unknown_alias__") == null);
}
`)
    const p = Bun.spawnSync([zig!, 'test', '--dep', 'aliases', `-Mroot=${main}`, `-Maliases=${aliases}`], { cwd: root, stdout: 'pipe', stderr: 'pipe', timeout: 25_000 })
    expect(p.exitCode, p.stdout.toString() + p.stderr.toString()).toBe(0)
  }
  finally { rmSync(root, { recursive: true, force: true }) }
}, 30_000)
