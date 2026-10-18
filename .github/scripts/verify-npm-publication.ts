import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const executable = resolve(process.argv[2] || '')
if (!process.argv[2]) throw new Error('Pass the actual published or normally built Pantry executable')
const root = await mkdtemp(join(tmpdir(), 'pantry-publication-confirmation-'))
const name = '@pantry-fixture/confirmation', version = '1.0.0'

async function check(mode: 'metadata-delay' | 'tarball-delay' | 'wrong-bytes' | 'never-visible') {
  const cwd = join(root, mode)
  await mkdir(cwd)
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ name, version, files: ['index.txt'] }))
  await writeFile(join(cwd, 'index.txt'), 'Immutable publication fixture\n')
  let uploads = 0, metadataReads = 0, tarballReads = 0
  const requests: Array<{ method: string, path: string }> = []
  let tarball = Buffer.alloc(0), metadata: Record<string, unknown> = {}
  const server: Bun.Server<undefined> = Bun.serve({
    hostname: '127.0.0.1', port: 0,
    async fetch(request) {
      const path = decodeURIComponent(new URL(request.url).pathname)
      requests.push({ method: request.method, path })
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
        return Response.json({ success: true }, { status: mode === 'tarball-delay' ? 201 : 202 })
      }
      if (request.method === 'GET' && path === `/${name}/${version}`) {
        metadataReads++
        if (mode === 'never-visible' || (mode === 'metadata-delay' && metadataReads <= 2))
          return Response.json({ error: 'not yet visible' }, { status: 404 })
        return Response.json(metadata)
      }
      if (request.method === 'GET' && path === '/fixture.tgz') {
        tarballReads++
        if (mode === 'tarball-delay' && tarballReads <= 2) return new Response('not yet visible', { status: 404 })
        return new Response(mode === 'wrong-bytes' ? 'different immutable bytes' : tarball)
      }
      return new Response('Unexpected publication request', { status: 400 })
    },
  })
  const child = Bun.spawn([executable, 'publish', '--npm', '--no-oidc', '--ignore-scripts', '--access', 'public', '--registry', server.url.origin], {
    cwd, env: { ...process.env, NPM_TOKEN: 'disposable-loopback-fixture-only' }, stdout: 'pipe', stderr: 'pipe',
  })
  const timeout = setTimeout(() => child.kill(), 145_000)
  try {
    const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])
    const output = stdout + stderr
    if (uploads !== 1) throw new Error(`${mode}: expected exactly one upload, got ${uploads}; requests=${JSON.stringify(requests)}; exit=${code}\n${output}`)
    if (!metadataReads) throw new Error(`${mode}: CLI reported completion without reading public version metadata\n${output}`)
    const success = mode === 'metadata-delay' || mode === 'tarball-delay'
    if (success && (code !== 0 || !tarballReads)) throw new Error(`${mode}: publication was not verified\n${output}`)
    if (!success && (code === 0 || /✓ Published/.test(output))) throw new Error(`${mode}: unverified publication was reported successful\n${output}`)
    if (mode === 'metadata-delay' && metadataReads < 3) throw new Error('Metadata delay was not exercised')
    if (mode === 'tarball-delay' && tarballReads < 3) throw new Error('Tarball delay was not exercised')
    if (mode === 'never-visible' && !/pending|not yet.*public/i.test(output)) throw new Error(`An accepted upload must remain pending, not be declared missing\n${output}`)
    console.log(JSON.stringify({ mode, code, uploads, metadataReads, tarballReads, verified: success }))
  }
  finally {
    clearTimeout(timeout)
    if (child.exitCode === null) child.kill()
    await child.exited
    await server.stop(true)
  }
}

try {
  for (const mode of ['metadata-delay', 'tarball-delay', 'wrong-bytes', 'never-visible'] as const) await check(mode)
}
finally {
  await rm(root, { recursive: true, force: true })
}
