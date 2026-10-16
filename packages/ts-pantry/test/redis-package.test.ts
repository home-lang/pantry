import { describe, expect, test } from 'bun:test'
import { redisPackage } from '../src/packages/redisio'
import { recipe } from '../src/recipes/redis.io'
import { readFileSync } from 'node:fs'

describe('Redis runtime metadata', () => {
  test('installs the OpenSSL ABI required by the published Linux binary', () => {
    expect(redisPackage.dependencies).toContain('openssl.org^1.1')
    expect(redisPackage.dependencies).not.toContain('openssl.org^3')
    expect(recipe.buildDependencies).toEqual({ 'openssl.org': '^3' })
    expect(recipe.dependencies).toBeUndefined()
    const catalog = readFileSync(new URL('../../zig/src/packages/generated.zig', import.meta.url), 'utf8')
    const redis = catalog.split('.domain = \"redis.io\",')[1]?.split('}, .{')[0]
    expect(redis).toContain('.dependencies = &[_][]const u8{\"openssl.org^1.1\"}')
  })
})
