import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const executable = resolve(process.argv[2] || '')
if (!process.argv[2]) throw new Error('Pass the actual published or normally built Pantry executable')
const segment = process.argv[3] || 'all'
if (!['all', 'transport', 'lookup', 'availability', 'encoding', 'lookup-recovery'].includes(segment)) throw new Error('Unknown publication contract segment')
const root = await mkdtemp(join(tmpdir(), 'pantry-publication-confirmation-'))
const name = '@pantry-fixture/confirmation', version = '1.0.0'

async function check(mode: 'metadata-delay' | 'tarball-delay' | 'wrong-bytes' | 'never-visible' | 'stalled-tarball' | 'generic-command' | 'restricted-package' | 'restricted-redirect' | 'restricted-existing' | 'compressed-metadata' | 'compressed-tarball') {
  const privateMode = mode === 'restricted-package' || mode === 'restricted-redirect' || mode === 'restricted-existing'
  const cwd = join(root, mode)
  await mkdir(cwd)
  await writeFile(join(cwd, 'index.txt'), 'Immutable publication fixture\n')
  let uploads = 0, metadataReads = 0, tarballReads = 0, credentialReads = 0, foreignCredentialReads = 0, foreignTarballReads = 0
  const requests: Array<{ method: string, path: string }> = []
  let tarball = Buffer.alloc(0), metadata: Record<string, unknown> = {}
  const downloadServer = mode === 'restricted-redirect' ? Bun.serve({
    hostname: '127.0.0.1', port: 0,
    fetch(request) {
      foreignTarballReads++
      if (request.headers.has('authorization')) foreignCredentialReads++
      return new Response(tarball)
    },
  }) : null
  const server: Bun.Server<undefined> = Bun.serve({
    hostname: '127.0.0.1', port: 0, idleTimeout: 0,
    async fetch(request) {
      const path = decodeURIComponent(new URL(request.url).pathname)
      requests.push({ method: request.method, path })
      if (request.method === 'GET' && request.headers.has('authorization')) credentialReads++
      if (request.method === 'PUT' && path === `/${name}`) {
        uploads++
        const body = await request.json() as { versions: Record<string, Record<string, unknown>>, _attachments: Record<string, { data: string }> }
        const attachment = Object.values(body._attachments)[0]
        if (!attachment) return new Response('Missing immutable attachment', { status: 400 })
        tarball = Buffer.from(attachment.data, 'base64')
        metadata = { ...body.versions[version], name, version, dist: {
          tarball: `${server.url}fixture.tgz`,
          integrity: `sha512-${createHash('sha512').update(tarball).digest('base64')}`,
          shasum: createHash('sha1').update(tarball).digest('hex'),
        } }
        if (mode === 'restricted-existing') return Response.json({ error: 'EPUBLISHCONFLICT', reason: 'Cannot publish over previously staged version' }, { status: 409 })
        return Response.json({ success: true }, { status: mode === 'tarball-delay' ? 201 : 202 })
      }
      if (request.method === 'GET' && path === `/${name}/${version}`) {
        metadataReads++
        if (uploads && privateMode && request.headers.get('authorization') !== 'Bearer disposable-loopback-fixture-only')
          return new Response('Private package needs its registry credential', { status: 401 })
        if (uploads === 0 || mode === 'never-visible' || (mode === 'metadata-delay' && metadataReads <= 2))
          return Response.json({ error: 'not yet visible' }, { status: 404 })
        if (mode === 'compressed-metadata') return new Response(Bun.gzipSync(JSON.stringify(metadata)), { headers: { 'Content-Encoding': 'gzip', 'Content-Type': 'application/json' } })
        return Response.json(metadata)
      }
      if (request.method === 'GET' && path === '/fixture.tgz') {
        tarballReads++
        if (privateMode && request.headers.get('authorization') !== 'Bearer disposable-loopback-fixture-only')
          return new Response('Private tarball needs its registry credential', { status: 401 })
        if (downloadServer) return new Response(null, { status: 302, headers: { Location: `${downloadServer.url}payload.tgz` } })
        if (mode === 'tarball-delay' && tarballReads <= 2) return new Response('not yet visible', { status: 404 })
        if (mode === 'stalled-tarball') {
          // A valid response head and partial body must not defeat the CLI's
          // deadline. server.stop(true) closes this owned stream in finally.
          return new Response(new ReadableStream({
            start(controller) { controller.enqueue(tarball.subarray(0, 1)) },
          }), { headers: { 'Content-Length': String(tarball.length) } })
        }
        if (mode === 'compressed-tarball') return new Response(Bun.gzipSync(tarball), { headers: { 'Content-Encoding': 'gzip' } })
        return new Response(mode === 'wrong-bytes' ? 'different immutable bytes' : tarball)
      }
      return new Response('Unexpected publication request', { status: 400 })
    },
  })
  await writeFile(join(cwd, 'package.json'), JSON.stringify({
    name, version, files: ['index.txt'], publishConfig: {
      // The generic command must use the explicit option ahead of this
      // different private manifest URL, without contacting a public registry.
      registry: mode === 'generic-command' ? 'http://127.0.0.1:1' : server.url.origin,
    },
  }))
  // Both command surfaces must preserve the explicit private registry URL.
  const command = mode === 'generic-command' ? ['publish', '--npm'] : ['npm:publish']
  const child = Bun.spawn([executable, ...command, '--no-oidc', '--ignore-scripts', '--access', privateMode ? 'restricted' : 'public', '--registry', server.url.origin], {
    cwd, env: { ...process.env, NPM_TOKEN: 'disposable-loopback-fixture-only' }, stdout: 'pipe', stderr: 'pipe',
  })
  const timeout = setTimeout(() => child.kill(), 145_000)
  try {
    const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])
    const output = stdout + stderr
    if (mode === 'precheck-recovers' && metadataReads !== 4) throw new Error(`Recovered precheck must observe two transport failures, a confirmed missing version and exact uploaded metadata; reads=${metadataReads}`)
    if (uploads !== 1) throw new Error(`${mode}: expected exactly one upload, got ${uploads}; requests=${JSON.stringify(requests)}; exit=${code}\n${output}`)
    if (!metadataReads) throw new Error(`${mode}: CLI reported completion without reading public version metadata\n${output}`)
    if (!privateMode && credentialReads) throw new Error(`${mode}: public verification forwarded publishing credentials`)
    if (privateMode && !credentialReads) throw new Error(`${mode}: private readback never authenticated to its registry`)
    if (foreignCredentialReads) throw new Error('Restricted credentials crossed a redirect origin')
    if (downloadServer && !foreignTarballReads) throw new Error('The separate tarball origin was not exercised')
    const success = mode === 'metadata-delay' || mode === 'tarball-delay' || mode === 'generic-command' || privateMode || mode === 'compressed-metadata' || mode === 'compressed-tarball'
    if (success && (code !== 0 || !tarballReads)) throw new Error(`${mode}: publication was not verified\n${output}`)
    if (!success && (code === 0 || /✓ Published/.test(output))) throw new Error(`${mode}: unverified publication was reported successful\n${output}`)
    if (mode === 'metadata-delay' && metadataReads < 3) throw new Error('Metadata delay was not exercised')
    if (mode === 'tarball-delay' && tarballReads < 3) throw new Error('Tarball delay was not exercised')
    if ((mode === 'never-visible' || mode === 'stalled-tarball') && !/pending|not yet.*public/i.test(output)) throw new Error(`An accepted upload must remain pending, not be declared missing\n${output}`)
    console.log(JSON.stringify({ mode, code, uploads, metadataReads, tarballReads, credentialReads, foreignCredentialReads, foreignTarballReads, verified: success }))
  }
  finally {
    clearTimeout(timeout)
    if (child.exitCode === null) child.kill()
    await child.exited
    await server.stop(true)
    await downloadServer?.stop(true)
  }
}

async function checkAmbiguousUpload(mode: 'lost-response' | 'server-error-after-commit' | 'upload-redirect' | 'stalled-upload-response' | 'precheck-stalled-head' | 'precheck-stalled-body' | 'precheck-unavailable' | 'precheck-disconnected' | 'precheck-unauthorized' | 'precheck-forbidden' | 'precheck-recovers') {
  const cwd = join(root, mode)
  await mkdir(cwd)
  await writeFile(join(cwd, 'index.txt'), 'Immutable ambiguous-response fixture\n')
  const marker = join(cwd, 'postpublish-ran')
  const prepublishMarker = join(cwd, 'prepublish-ran')
  const precheckFailure = mode.startsWith('precheck-') && mode !== 'precheck-recovers'
  let uploads = 0, metadataReads = 0, tarballReads = 0, foreignRequests = 0, foreignCredentialRequests = 0
  let prematureHook = false
  let tarball = Buffer.alloc(0), metadata: Record<string, unknown> = {}
  const foreign = createServer((request, response) => {
    foreignRequests++
    if (request.headers.authorization || request.headers['npm-otp']) foreignCredentialRequests++
    response.writeHead(200, { 'Content-Type': 'application/json' }).end('{"success":true}')
  })
  await new Promise<void>((resolve, reject) => foreign.once('error', reject).listen(0, '127.0.0.1', resolve))
  const foreignAddress = foreign.address()
  if (!foreignAddress || typeof foreignAddress === 'string') throw new Error('Missing owned foreign listener')
  const foreignUrl = `http://127.0.0.1:${foreignAddress.port}/foreign`
  const server = createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url || '/', origin).pathname)
      if (request.method === 'PUT' && path === `/${name}`) {
        uploads++
        const chunks: Buffer[] = []
        for await (const chunk of request) chunks.push(Buffer.from(chunk))
        const body = JSON.parse(Buffer.concat(chunks).toString()) as { versions: Record<string, Record<string, unknown>>, _attachments: Record<string, { data: string }> }
        const attachment = Object.values(body._attachments)[0]
        if (!attachment) throw new Error('No immutable upload attachment')
        tarball = Buffer.from(attachment.data, 'base64')
        metadata = { ...body.versions[version], name, version, dist: {
          tarball: `${origin}/fixture.tgz`,
          integrity: `sha512-${createHash('sha512').update(tarball).digest('base64')}`,
        } }
        if (uploads > 1) {
          response.writeHead(409, { 'Content-Type': 'application/json' }).end('{"error":"EPUBLISHCONFLICT","reason":"Cannot publish over previously staged version"}')
        }
        else if (mode === 'lost-response') request.socket.destroy()
        else if (mode === 'server-error-after-commit') response.writeHead(503).end('Upload committed; response failed')
        else if (mode === 'upload-redirect') response.writeHead(303, { Location: foreignUrl }).end()
        else if (mode === 'stalled-upload-response') {
          response.writeHead(202, { 'Content-Type': 'application/json', 'Content-Length': '16' })
          response.write('{')
        }
        else response.writeHead(202, { 'Content-Type': 'application/json' }).end('{"success":true}')
        return
      }
      if (request.method === 'GET' && path === `/${name}/${version}`) {
        metadataReads++
        if (!uploads && mode === 'precheck-unavailable') { response.writeHead(502).end(); return }
        if (!uploads && mode === 'precheck-unauthorized') { response.writeHead(401).end(); return }
        if (!uploads && mode === 'precheck-forbidden') { response.writeHead(403).end(); return }
        if (!uploads && mode === 'precheck-recovers' && metadataReads < 3) { request.socket.destroy(); return }
        if (!uploads && mode === 'precheck-disconnected') { request.socket.destroy(); return }
        if (!uploads && mode === 'precheck-stalled-head') return
        if (!uploads && mode === 'precheck-stalled-body') {
          response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': '16' })
          response.write('{')
          return
        }
        if (!uploads || mode === 'upload-redirect') { response.writeHead(404).end(); return }
        if (existsSync(marker)) prematureHook = true
        response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(metadata))
        return
      }
      if (request.method === 'GET' && path === '/fixture.tgz') {
        tarballReads++
        if (existsSync(marker)) prematureHook = true
        response.writeHead(200, { 'Content-Length': String(tarball.length) }).end(tarball)
        return
      }
      response.writeHead(400).end('Unexpected fixture request')
    }
    catch (error) { response.destroy(error instanceof Error ? error : new Error(String(error))) }
  })
  await new Promise<void>((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing owned registry listener')
  const origin = `http://127.0.0.1:${address.port}`
  await writeFile(join(cwd, 'package.json'), JSON.stringify({
    name, version, files: ['index.txt'], publishConfig: { registry: origin },
    scripts: {
      prepublishOnly: `bun -e 'await Bun.write("prepublish-ran", "yes")'`,
      postpublish: `bun -e 'await Bun.write("postpublish-ran", "yes")'`,
    },
  }))
  const child = Bun.spawn([executable, 'npm:publish', '--no-oidc', '--access', 'public', '--otp', '123456', '--registry', origin], {
    cwd, env: { ...process.env, NPM_TOKEN: 'disposable-loopback-fixture-only' }, stdout: 'pipe', stderr: 'pipe',
  })
  const timeout = setTimeout(() => child.kill(), 145_000)
  try {
    const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])
    const output = stdout + stderr
    if (foreignRequests || foreignCredentialRequests) throw new Error(`${mode}: sensitive upload followed a foreign redirect; requests=${foreignRequests}, credentialRequests=${foreignCredentialRequests}`)
    if (precheckFailure) {
      if (code === 0 || uploads !== 0 || !metadataReads || existsSync(marker) || existsSync(prepublishMarker) || !output.includes('Upload was not started'))
        throw new Error(`${mode}: a failed availability lookup must stop before hooks or upload; code=${code}, uploads=${uploads}, metadataReads=${metadataReads}\n${output}`)
      console.log(JSON.stringify({ mode, code, uploads, metadataReads, prepublishHook: false, postpublishHook: false, verifiedNoUpload: true }))
      return
    }
    if (mode === 'precheck-recovers' && metadataReads !== 4) throw new Error(`Recovered precheck must observe two transport failures, a confirmed missing version and exact uploaded metadata; reads=${metadataReads}`)
    if (uploads !== 1) throw new Error(`${mode}: accepted upload was repeated ${uploads} times; exit=${code}\n${output}`)
    if (mode === 'upload-redirect') {
      if (code === 0 || existsSync(marker)) throw new Error('An unverified redirect completed publication or ran its hook')
    }
    else if (code !== 0 || !tarballReads || !existsSync(marker) || prematureHook) {
      throw new Error(`${mode}: exact uploaded bytes must be verified before success and postpublish; code=${code}, metadataReads=${metadataReads}, tarballReads=${tarballReads}, hook=${existsSync(marker)}, prematureHook=${prematureHook}\n${output}`)
    }
    console.log(JSON.stringify({ mode, code, uploads, metadataReads, tarballReads, foreignRequests, foreignCredentialRequests, hook: existsSync(marker), prematureHook }))
  }
  finally {
    clearTimeout(timeout)
    if (child.exitCode === null) child.kill()
    await child.exited
    server.closeAllConnections()
    foreign.closeAllConnections()
    await Promise.all([
      new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())),
      new Promise<void>((resolve, reject) => foreign.close(error => error ? reject(error) : resolve())),
    ])
  }
}

try {
  const failures: string[] = []
  if (segment === 'all' || segment === 'transport') for (const mode of ['lost-response', 'server-error-after-commit', 'upload-redirect', 'stalled-upload-response'] as const) {
    try { await checkAmbiguousUpload(mode) }
    catch (error) { console.error(error); failures.push(mode) }
  }
  if (segment === 'lookup-recovery') {
    try { await checkAmbiguousUpload('precheck-recovers') }
    catch (error) { console.error(error); failures.push('precheck-recovers') }
  }
  if (segment === 'all' || segment === 'lookup') for (const mode of ['precheck-unavailable', 'precheck-disconnected', 'precheck-unauthorized', 'precheck-forbidden', 'precheck-stalled-head', 'precheck-stalled-body', 'precheck-recovers'] as const) {
    try { await checkAmbiguousUpload(mode) }
    catch (error) { console.error(error); failures.push(mode) }
  }
  if (segment === 'all' || segment === 'availability') for (const mode of ['restricted-package', 'restricted-redirect', 'restricted-existing', 'metadata-delay', 'tarball-delay', 'wrong-bytes', 'never-visible', 'stalled-tarball', 'generic-command'] as const) {
    try { await check(mode) }
    catch (error) {
      console.error(error)
      failures.push(mode)
    }
  }
  if (segment === 'all' || segment === 'encoding') for (const mode of ['compressed-metadata', 'compressed-tarball'] as const) {
    try { await check(mode) }
    catch (error) { console.error(error); failures.push(mode) }
  }
  if (failures.length) throw new Error(`Publication contracts failed: ${failures.join(', ')}`)
}
finally {
  await rm(root, { recursive: true, force: true })
}
