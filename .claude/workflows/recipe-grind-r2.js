export const meta = {
  name: 'recipe-grind-r2',
  description: 'Round 2: fix recipes that still fail the real toolchain build (read actual CI error tail; never skip)',
  phases: [{ title: 'Fix' }],
}

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    domain: { type: 'string' },
    action: { type: 'string', enum: ['fixed', 'no-change-needed', 'needs-followup'] },
    rootCause: { type: 'string' },
    changeSummary: { type: 'string' },
    filesEdited: { type: 'array', items: { type: 'string' } },
    // For needs-followup only: a change OUTSIDE the recipe file that I must apply centrally
    blocker: { type: 'string' },
    requiredChange: { type: 'string' },
    requiredChangeKind: { type: 'string', enum: ['ci-apt-lib', 'ci-brew-lib', 'new-dep-recipe', 'engine', 'other', 'none'] },
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
  const safe = d.replace(/\//g, '__')
  return `You are fixing ONE source-build recipe that STILL FAILS the real CI toolchain build, in the pantry monorepo at ${REPO}.

PACKAGE DOMAIN: ${d}
RECIPE FILE: packages/ts-pantry/src/recipes/${d}.ts

This recipe was already re-aligned with its upstream pkgx package.yml in a prior pass, yet it still failed when actually compiled in CI (Linux x86-64 / macOS arm64) and was NOT published to the Hetzner registry. Your job is to make it actually build and publish — for EVERY platform it claims to support.

STEP 1 — read the REAL failure. The exact last ~100 lines of this package's CI build (per platform it failed on) are here:
   cat /tmp/r2logs/${safe}.log
Find the genuine compiler/configure/linker/download error (look above the "Build failed" / "End script" markers). The header line "===== ${d} on <platform> =====" tells you which platform each slice is from — fixes may need to be platform-gated.

STEP 2 — read the recipe (packages/ts-pantry/src/recipes/${d}.ts), the Recipe type (packages/ts-pantry/scripts/recipe-types.ts), and the upstream reference:
   curl -fsSL https://raw.githubusercontent.com/pkgxdev/pantry/main/projects/${d}/package.yml
   curl -fsSL https://api.github.com/repos/pkgxdev/pantry/contents/projects/${d}

STEP 3 — FIX IT. Diagnose the real error and repair the recipe. Likely causes at this stage:
   - a genuinely missing build/runtime dependency that DOES exist as a recipe (add it, platform-key it if needed),
   - a missing ./configure flag, env var (CFLAGS/LDFLAGS/PKG_CONFIG_PATH), or pkg-config dep dir,
   - platform-specific breakage needing an \`if: darwin\` / \`if: linux\` gate or per-platform env,
   - a download/version/tag 404,
   - missing props, or a wrong working-directory.

STEP 4 — VALIDATE:
   - cd ${REPO}/packages/ts-pantry && bunx --bun pickier src/recipes/${d}.ts   (must be clean)
   - cd ${REPO} && bun -e "await import('./packages/ts-pantry/src/recipes/${d}.ts')"   (must not throw)

HARD CONSTRAINTS:
   - ONLY edit packages/ts-pantry/src/recipes/${d}.ts and files under packages/ts-pantry/src/recipes/props/${d}/ (or create packages/ts-pantry/src/recipes/${d}/*.ts for sub-deps). NEVER edit shared files (build-all-packages.ts, package-overrides.ts, buildkit.ts, recipe-types.ts, any workflow) — other agents edit in parallel and I apply shared changes centrally.
   - DO NOT git commit / push / bun install.

DO NOT SKIP. Skip-listing is forbidden. You must either FIX it (action "fixed"), confirm it is already correct and the failure was transient/infra (action "no-change-needed", explain why), OR — only if the real fix REQUIRES a change outside your recipe file — set action "needs-followup" and fill:
   - blocker: the exact error blocking the build,
   - requiredChange: the precise change needed (e.g. "add libfoo-dev to the Linux apt list in sync-binaries.yml", "create a new recipe for dep bar.org", "buildkit must support X"),
   - requiredChangeKind: one of ci-apt-lib | ci-brew-lib | new-dep-recipe | engine | other.
   Still make any in-recipe portion of the fix you can. needs-followup is NOT a skip — it is a precise hand-off so I can apply the shared change and the package WILL build.

You cannot run the real toolchain; reason from the actual error log + the pkgx reference. Return ONLY the structured result.`
}

phase('Fix')
const results = await parallel(domains.map(d => () =>
  agent(promptFor(d), { label: `r2:${d}`, phase: 'Fix', schema: RESULT_SCHEMA, agentType: 'general-purpose' })
))
const ok = results.filter(Boolean)
const by = a => ok.filter(r => r.action === a).length
log(`Round2 done: ${ok.length}/${domains.length}. fixed=${by('fixed')} no-change=${by('no-change-needed')} needs-followup=${by('needs-followup')}`)
return ok
