import { renameSync, writeFileSync } from 'node:fs'
import { startNativeService } from '../native-services'
import { parseServiceSpecs } from '../services'

const [binDir, temporaryRoot, stateFile] = process.argv.slice(2)
if (!binDir || !temporaryRoot || !stateFile) throw new Error('Expected native fixture paths')

await startNativeService(parseServiceSpecs('postgres@17.11')[0]!, binDir, temporaryRoot, {
  onState(state) {
    writeFileSync(`${stateFile}.next`, JSON.stringify([state]), { mode: 0o600 })
    renameSync(`${stateFile}.next`, stateFile)
  },
})
throw new Error('Cancellation fixture unexpectedly completed readiness')
