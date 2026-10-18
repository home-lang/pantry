import { expect, test } from 'bun:test'
import { copyFileSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { recipe } from '../src/recipes/android.com/cmdline-tools'

test('Android launcher JVM properties retain an installed and relocated SDK path with spaces', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-android-launcher-'))
  try {
    const prefix = join(root, 'original SDK')
    const bin = join(prefix, 'libexec/cmdline-tools/latest/bin')
    mkdirSync(bin, { recursive: true })
    mkdirSync(join(root, 'props'))
    copyFileSync(new URL('../props/android.com/cmdline-tools/quote-tools-dir.sed', import.meta.url), join(root, 'props/quote-tools-dir.sed'))
    // The exact default property and eval boundary from the official launcher.
    writeFileSync(join(bin, 'apkanalyzer'), String.raw`APP_HOME=$1
DEFAULT_JVM_OPTS='-Dcom.android.sdklib.toolsdir=$APP_HOME'
CLASSPATH=$APP_HOME/lib/apkanalyzer-classpath.jar
eval set -- $DEFAULT_JVM_OPTS -classpath "\"$CLASSPATH\"" com.android.tools.apk.analyzer.ApkAnalyzerCli
printf '%s\n' "$@"
`)
    const script = recipe.build.script as string[]
    const first = script.findIndex(line => typeof line === 'string' && line.startsWith('for launcher'))
    const last = script.indexOf('done', first)
    expect(first).toBeGreaterThanOrEqual(0)
    const patched = Bun.spawnSync(['bash', '-eu', '-c', script.slice(first, last + 1).join('\n').replaceAll('{{prefix}}', prefix)], { cwd: root })
    expect(patched.exitCode).toBe(0)
    const moved = join(root, 'relocated SDK with spaces')
    renameSync(prefix, moved)
    const home = join(moved, 'libexec/cmdline-tools/latest')
    const result = Bun.spawnSync(['bash', join(home, 'bin/apkanalyzer'), home])
    expect(result.exitCode).toBe(0)
    expect(result.stdout.toString().trim().split('\n')).toEqual([
      `-Dcom.android.sdklib.toolsdir=${home}`,
      '-classpath', `${home}/lib/apkanalyzer-classpath.jar`,
      'com.android.tools.apk.analyzer.ApkAnalyzerCli',
    ])
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
