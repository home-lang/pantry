export const meta = {
  name: 'recipe-grind',
  description: 'Fix failing source-build recipes by re-aligning with upstream pkgx; skip genuinely unbuildable',
  phases: [{ title: 'Fix' }],
}

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    domain: { type: 'string' },
    action: { type: 'string', enum: ['fixed', 'skip', 'no-change-needed', 'uncertain'] },
    rootCause: { type: 'string' },
    changeSummary: { type: 'string' },
    filesEdited: { type: 'array', items: { type: 'string' } },
    skipSpec: { type: 'string' },
    skipReason: { type: 'string' },
    pickierPassed: { type: 'boolean' },
    importPassed: { type: 'boolean' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['domain', 'action', 'rootCause', 'changeSummary', 'confidence'],
}

const REPO = '/Users/chrisbreuer/Code/Tools/pantry'
let domains = args
if (typeof domains === 'string') {
  try { domains = JSON.parse(domains) }
  catch { domains = domains.split(/[\s,]+/).filter(Boolean) }
}
if (!Array.isArray(domains)) throw new Error(`args is not an array of domains: ${typeof domains}`)

function promptFor(d) {
  return `You are fixing ONE failing source-build recipe in the pantry monorepo at ${REPO}.

PACKAGE DOMAIN: ${d}
RECIPE FILE: packages/ts-pantry/src/recipes/${d}.ts

GOAL: make this package build from source so CI can upload it to the Hetzner registry — OR, if it is genuinely impossible to source-build, mark it to be skip-listed with a precise reason.

BACKGROUND: these native TS recipes were auto-converted from pkgx's pantry and are frequently LOSSY: missing build/runtime dependencies, dropped ./configure flags / build.env / working-directory / version-gates, missing "props" (sibling patch/config files the build references), and leaked pkgx \`test:\` steps that abort under \`set -e\`. The upstream pkgx recipe is the source of truth.

STEPS (do them in order):
1. Read packages/ts-pantry/src/recipes/${d}.ts and the Recipe type at packages/ts-pantry/scripts/recipe-types.ts.
2. Read this package's CI failure hint:
   bun -e "const c=require('/tmp/grind-context.json'); console.log(JSON.stringify(c.find(x=>x.d==='${d}')||{}, null, 2))"
   NOTE: that error text is extracted from interleaved CI logs and may be NOISY or cross-contaminated with an adjacent package. Treat it as a weak hint; verify it actually corresponds to THIS package before acting on it.
3. Fetch the upstream pkgx reference (try; ignore if it 404s):
   curl -fsSL https://raw.githubusercontent.com/pkgxdev/pantry/main/projects/${d}/package.yml
   Also list sibling props/patches it may reference:
   curl -fsSL https://api.github.com/repos/pkgxdev/pantry/contents/projects/${d}
4. Diagnose, then FIX the recipe in-place. Typical fixes:
   - add missing dependencies / buildDependencies (use domain names that exist under packages/ts-pantry/src/recipes or src/packages),
   - re-port dropped configure flags, build.env, working-directory, version "if:" gates from pkgx,
   - fix a dead/wrong download url or version/tag template (404 errors),
   - carry missing props into packages/ts-pantry/src/recipes/props/${d}/ and set propsDir on the recipe,
   - strip leaked pkgx test steps from build.script (lines using \$SAMPLE / \$FIXTURE / \`pkgx ...\`),
   - strip literal quotes from template args (--prefix="{{prefix}}" -> --prefix={{prefix}}).

HARD CONSTRAINTS:
   - ONLY edit packages/ts-pantry/src/recipes/${d}.ts and files under packages/ts-pantry/src/recipes/props/${d}/ (or create packages/ts-pantry/src/recipes/${d}/*.ts for sub-deps). NEVER edit any shared file (build-all-packages.ts, package-overrides.ts, index.ts, recipe-types.ts) — other agents are editing in parallel.
   - Prefer faithfully mirroring the known-good pkgx recipe over inventing new build logic.
   - Do NOT run git, bun install, or anything that mutates the repo outside your recipe/props files.
5. VALIDATE your edit:
   - cd ${REPO}/packages/ts-pantry && bunx --bun pickier src/recipes/${d}.ts   (must be clean)
   - cd ${REPO} && bun -e "await import('./packages/ts-pantry/src/recipes/${d}.ts')"   (must not throw)
6. If the package is GENUINELY unbuildable from source — proprietary binary-only app, dead/renamed upstream whose source tarball 404s with no replacement, needs a toolchain unavailable in Linux/macOS CI, or a known upstream self-bootstrap bug — do NOT hack it. Set action="skip", give a precise skipReason and skipSpec ("*" = all versions). A correct skip beats a wrong fix.

You CANNOT run the real compiler toolchain, so you cannot fully build it — rely on the pkgx reference plus careful reasoning, and set confidence accordingly (high only if you mirrored pkgx closely or the fix is unambiguous).

Return ONLY the structured result object (domain, action, rootCause, changeSummary, filesEdited, skipSpec, skipReason, pickierPassed, importPassed, confidence).`
}

phase('Fix')
const results = await parallel(domains.map(d => () =>
  agent(promptFor(d), { label: `fix:${d}`, phase: 'Fix', schema: RESULT_SCHEMA, agentType: 'general-purpose' })
))
const ok = results.filter(Boolean)
const by = a => ok.filter(r => r.action === a).length
log(`Done: ${ok.length}/${domains.length} returned. fixed=${by('fixed')} skip=${by('skip')} no-change=${by('no-change-needed')} uncertain=${by('uncertain')}`)
return ok
