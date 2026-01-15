# Pantry TODO

## Context
The goal is to have a fully automated release workflow through the CLI. NPM's trusted publisher requires manual browser login with 2FA which cannot be automated. The priority is building our own registry driver while keeping npm as a secondary driver for compatibility.

**Vision:** Rebuild npm as an independent registry, similar to Deno but more catered to our needs. If npm automation can't work around the limitations, finish the npm driver as-is and improve via our own driver.

**Long-term Goal:** The registry will ultimately pivot into a **marketplace** - making it easy to add paywalls to packages, etc.

**Existing Code:** Registry code already exists in `ts-pantry` repo - search for "registry" keywords.

---

## High Priority

### 1. Build Custom Registry Driver
**Status:** In Progress (core implementation complete)
**Description:** Build our own registry driver that mimics npm functionality. This becomes the default, with npm as an optional driver for compatibility.

**Architecture:**
- Backend should not be complicated - it's essentially lookup logic
- Use ts-cloud for S3 storage
- Fallback: if package doesn't exist in our registry, fallback to npmjs
- Package naming: plain names in our registry (`bun-router`), prefix on npm if taken (`@stacksjs/bun-router`)
- Consider using DynamoDB ORM driver for the registry API (cloud)

**Data Structure Considerations:**
- Download counts / analytics structure
- Packages vs Apps differentiation
- Single table design patterns

**Tasks:**
- [x] Review existing registry code in ts-pantry
- [x] Create/expand `registry` package in pantry monorepo (`packages/registry`)
- [x] Design data structure for packages, apps, analytics
- [x] Implement S3 storage abstraction (local storage for dev)
- [x] Implement package publish functionality
- [x] Implement package versioning
- [x] Implement package download/install with npmjs fallback
- [ ] Add DynamoDB metadata storage for production
- [ ] Deploy to own domain

### 2. Automate `pantry publish` End-to-End
**Status:** Complete
**Description:** Running `pantry publish` should handle all configuration automatically with no manual steps outside the CLI.

**Important:** Old npm token types have been phased out by npm - that's why we're doing OIDC now.

- [x] OIDC release workflow working
- [x] Auto-store tokens to `.env` file
- [x] Auto-store tokens to `~/.pantry` for persistence (reads from `~/.pantry/credentials`)
- [x] Prompt user for any required input through CLI only
- [x] Handle first-time publish (falls back to token if OIDC fails)
- [x] Handle subsequent publishes (uses OIDC)

### 3. GitHub Secrets Automation
**Status:** Deferred
**Description:** ~~Automate adding secrets to GitHub repositories through CLI.~~ Decided against separate command - users can use `gh secret set` directly. Focus is on making `pantry publish` work seamlessly with tokens stored in `~/.pantry/credentials`.

- [x] Token fallback: env vars → `~/.pantry/credentials` → helpful error message
- [ ] ~~Create command to setup GitHub secrets~~ (use `gh secret set` instead)
- [ ] ~~Integrate into `pantry publish` workflow~~

### 4. CI Workflow Naming Convention
**Status:** Complete
**Description:** Update CI workflow naming for clarity with multiple release targets.

**Pattern:**
- `Releaser / npm` - for npm releases
- `Releaser / pantry` - for pantry registry releases
- etc.

- [x] Update workflow names to follow convention
- [x] Ensure job names are similarly structured

---

## Medium Priority

### 5. Registry Analytics
**Status:** Not Started
**Description:** Track package statistics for visibility and insights.

- [ ] Implement download count tracking
- [ ] Store analytics data (DynamoDB)
- [ ] Expose analytics via API

### 6. Zig Package Manager Support
**Status:** Not Started
**Description:** Zig does not have an official package manager - pantry should support Zig packages too.

- [ ] Research Zig package structure/conventions
- [ ] Add Zig support to pantry
- [ ] Document Zig package publishing workflow

---

## Low Priority / Nice to Have

### 7. Minimal Registry UI
**Status:** Not Started
**Description:** A simple UI for browsing the registry. Not a priority initially.

**Stack:** stx for templating, Stacks for backend API

- [ ] Package search functionality
- [ ] Display download counts
- [ ] Package details page

**Differentiator:** We will have actual support (good luck contacting npm support if you ever need it).

### 8. Marketplace Features (Future)
**Status:** Not Started
**Description:** Pivot registry into a marketplace with monetization capabilities.

- [ ] Design paywall system for packages
- [ ] Implement payment integration
- [ ] Package licensing/access control
- [ ] Revenue sharing model for package authors

### 9. NPM Trusted Publisher Automation
**Status:** Deferred
**Description:** Full automation of npm trusted publisher setup. Currently blocked by browser 2FA requirement.

**Note:** Create GitHub issue for this. If people want this automation for the npm driver, it can be addressed later. The limitation will push users toward our registry instead.

- [ ] Create GitHub issue to track this
- [ ] Research if npm ever provides API for trusted publisher config
- [ ] Consider token types that don't get removed by npm

---

## Notes

- **Registry Priority:** Own registry is the default, npm is just a driver for current user compatibility
- **CLI-Only Principle:** All user interaction must happen through the CLI, never redirect to browser
- **Token Storage:** `.env` for project-level, `~/.pantry` for user-level persistence
- **Naming:** Use `@stacksjs/` prefix on npm if package name is taken; on our registry, can use plain names
- **Fallback Logic:** Package files can specify registry (npm, github, etc.) - if not in our registry, fallback to npmjs
- **npm Token Status:** Old token types phased out by npm, which is why OIDC is necessary
- **DynamoDB:** Good choice for analytics and registry API

---

## First Publish vs Subsequent Publish (npm driver)

**First Publish:**
- Requires tokens (can't use OIDC yet)
- Must publish to npm first before configuring trusted publisher
- Then configure trusted publisher manually (browser 2FA required)

**Subsequent Publishes:**
- Uses OIDC (no tokens needed)
- Fully automated via GitHub Actions

**Our Registry:**
- First publish AND subsequent publishes are fully automated
- No token management hassle
- No trusted publisher configuration needed
