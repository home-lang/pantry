import { describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { installRequiredSystemPackages, jsPackageManager, needsJsInstall, pantryConfigMaySetLinker, selectSystemPackages, shouldInstallWorkspace } from './install-mode'

describe('Pantry Action install mode', () => {
  test('all explicit roots reach one dependency plan before transitive selection', async () => {
    const roots = ['openjdk.org@17.0.20.8', 'android.com/cmdline-tools@14742923.0.0']
    const plans: string[][] = []
    await installRequiredSystemPackages(roots, async requested => {
      plans.push(Array.isArray(requested) ? requested : [requested])
    })
    expect(plans).toEqual([roots])
  })

  test('service-only setup does not install project dependencies', () => {
    let detected = false
    expect(selectSystemPackages('', true, () => {
      detected = true
      return ['zig']
    })).toEqual([])
    expect(detected).toBe(false)
    expect(shouldInstallWorkspace('', true)).toBe(false)
  })

  test('normal and explicit installs preserve their dependency selection', () => {
    expect(selectSystemPackages('', false, () => ['zig', 'node'])).toEqual(['zig', 'node'])
    expect(selectSystemPackages('zig@0.16.0 bun@1.3.14', true, () => [])).toEqual(['zig@0.16.0', 'bun@1.3.14'])
    expect(shouldInstallWorkspace('', false)).toBe(true)
    expect(shouldInstallWorkspace('zig', false)).toBe(false)
  })

  test('required system package failures reject the action', async () => {
    const attempted: string[] = []
    await expect(installRequiredSystemPackages(['bun.sh', 'zig@0.17.0-dev'], async packageSpecs => {
      attempted.push(...packageSpecs)
      throw new Error('socket hang up')
    })).rejects.toThrow('Required system packages bun.sh, zig@0.17.0-dev failed to install: socket hang up')
    expect(attempted).toEqual(['bun.sh', 'zig@0.17.0-dev'])
  })

  // The cache holds pantry/ only: a cache hit on a fresh checkout has no
  // node_modules, and the JS install has to run again to create it.
  test('a project with JS deps needs its JS install until node_modules is marked', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-js-'))
    try {
      expect(needsJsInstall(dir)).toBe(false)
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { 'bun.sh': '^1.4.2', 'ziglang.org': '0.16.0' } }))
      expect(needsJsInstall(dir)).toBe(false)
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ devDependencies: { typescript: '^5.9.3' } }))
      expect(needsJsInstall(dir)).toBe(true)
      fs.mkdirSync(path.join(dir, 'node_modules'))
      fs.writeFileSync(path.join(dir, 'node_modules', '.pantry-js-installed'), '')
      expect(needsJsInstall(dir)).toBe(false)
      fs.writeFileSync(path.join(dir, 'package.json'), '{ not json')
      expect(needsJsInstall(dir)).toBe(false)
    }
    finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })

  // A cache hit runs the package manager itself, so it must pick the one
  // `pantry install` would, and leave a configured linker to pantry install.
  test('picks the JS package manager as pantry install does', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-pm-'))
    try {
      expect(jsPackageManager(dir)).toBe('bun')
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ packageManager: 'pnpm@9.0.0' }))
      expect(jsPackageManager(dir)).toBe('pnpm')
      fs.writeFileSync(path.join(dir, 'yarn.lock'), '')
      expect(jsPackageManager(dir)).toBe('yarn')
      fs.writeFileSync(path.join(dir, 'bun.lock'), '')
      expect(jsPackageManager(dir)).toBe('bun')

      expect(pantryConfigMaySetLinker(dir)).toBe(false)
      fs.writeFileSync(path.join(dir, 'pantry.toml'), '[install]\nlinker = "hoisted"\n')
      expect(pantryConfigMaySetLinker(dir)).toBe(true)
    }
    finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})
