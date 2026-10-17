import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import type { PackageRecipe } from '../scripts/buildkit'
import { generateBuildScript } from '../scripts/buildkit'
import { recipe as awsCliRecipe } from '../src/recipes/aws.amazon.com/cli'

describe('Python-backed package runtime wrappers', () => {
  test('CPython preserves the Tcl/Tk 8.6 runtime required by its tkinter extension', async () => {
    const { loadRecipe } = await import('../scripts/recipe-loader')
    for (const platform of ['darwin-arm64', 'linux-arm64', 'linux-x86-64']) {
      const { recipe } = await loadRecipe('python.org', platform, '3.12.14')
      expect(recipe.dependencies?.['tcl-lang.org']).toBe('~8.6')
    }
  })

  test('only Linux CPython releases that still implement NIS declare its managed ABI', async () => {
    const { loadRecipe } = await import('../scripts/recipe-loader')
    for (const platform of ['linux-arm64', 'linux-x86-64', 'darwin-arm64']) {
      for (const version of ['3.12.14', '3.13.10', '3.14.0']) {
        const { recipe } = await loadRecipe('python.org', platform, version)
        const linux = recipe.dependencies?.linux
        if (platform.startsWith('linux') && version.startsWith('3.12.')) {
          expect(linux?.['github.com/thkukuk/libnsl']).toBe('^2')
          expect(linux?.['sourceforge.net/libtirpc']).toBe('^1')
          expect(linux?.['github.com/besser82/libxcrypt']).toBe('^4')
        }
        else if (!version.startsWith('3.12.')) expect(linux?.['github.com/thkukuk/libnsl']).toBeUndefined()
        const script = generateBuildScript(recipe as PackageRecipe, 'python.org', version, platform, '/tmp/python', '/tmp/build', {})
        const syntax = spawnSync('/bin/bash', ['-n'], { input: script, encoding: 'utf8' })
        expect(syntax.status).toBe(0)
        if (platform.startsWith('darwin')) expect(script).toContain('LIBMPDEC_CFLAGS="-DCONFIG_64=1"')
        expect(recipe.test?.required).toBe(true)
      }
    }
  })

  test('AWS CLI declares Python as a runtime dependency', () => {
    expect(awsCliRecipe.dependencies?.['python.org']).toBe('>=3.11<3.15')
  })

  test('bkpyvenv wrappers resolve Pantry-managed Python at runtime', () => {
    const buildRecipe: PackageRecipe = {
      build: awsCliRecipe.build,
      buildDependencies: awsCliRecipe.buildDependencies,
      dependencies: awsCliRecipe.dependencies,
    }
    const script = generateBuildScript(
      buildRecipe,
      'aws.amazon.com/cli',
      '2.34.15',
      'darwin-aarch64',
      '/tmp/aws-cli',
      '/tmp/build',
      { 'python.org': '/tmp/python' },
    )

    expect(script).toContain('SEARCH_DIR="$SCRIPT_DIR"')
    expect(script).toContain('if [ -x "$SEARCH_DIR/.bin/python3" ]')
    expect(script).toContain('exec "$PYTHON_BIN" "$VENV_DIR/bin/%s" "$@"')
  })
})
