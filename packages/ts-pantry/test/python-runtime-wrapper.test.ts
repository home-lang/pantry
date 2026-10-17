import { describe, expect, test } from 'bun:test'
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
