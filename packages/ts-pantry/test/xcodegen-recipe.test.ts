import { describe, expect, it } from 'bun:test'
import { recipe } from '../src/recipes/github.com/yonaskolb/XcodeGen'

describe('XcodeGen recipe', () => {
  it('installs the setting presets xcodegen reads beside its binary', () => {
    // Without ../share/xcodegen/SettingPresets xcodegen still exits 0, but every
    // project it writes loses the base build settings (ARC, warnings, SDK).
    expect(recipe.build.script).toContain('install -m755 xcodegen/bin/xcodegen {{prefix}}/bin/xcodegen')
    expect(recipe.build.script).toContain('cp -R xcodegen/share/xcodegen {{prefix}}/share/xcodegen')
    expect(recipe.test?.script).toContain('test -f {{prefix}}/share/xcodegen/SettingPresets/base.yml')
  })

  it('is macOS only', () => {
    expect(recipe.platforms).toEqual(['darwin/aarch64', 'darwin/x86-64'])
  })
})
