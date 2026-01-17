# Master Tasks

> This is the central task tracker. Individual TODO files exist in each project for granular tracking.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PANTRY ECOSYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │
│  │   pantry    │────▶│  ts-cloud   │     │  ts-pkgx    │               │
│  │  (registry) │     │ (S3 storage)│     │(build info) │               │
│  └──────┬──────┘     └─────────────┘     └─────────────┘               │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │                   bun-query-builder                      │           │
│  │  ┌─────────────────┐    ┌─────────────────────────┐     │           │
│  │  │     sql/        │    │      dynamodb/          │     │           │
│  │  │  MySQL/PG/SQLite│    │   (entity-centric)      │     │           │
│  │  └─────────────────┘    └───────────┬─────────────┘     │           │
│  └─────────────────────────────────────┼───────────────────┘           │
│                                        │ extends                        │
│                            ┌───────────▼─────────────┐                 │
│                            │    dynamodb-tooling     │                 │
│                            │  (single-table design)  │                 │
│                            └─────────────────────────┘                 │
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │
│  │    stx      │     │   stacks    │     │ bun-router  │               │
│  │  (heatmap)  │     │ (dashboard) │     │ (publish)   │               │
│  └─────────────┘     └─────────────┘     └─────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Status Summary

| Project | TODO File | Status | Priority |
|---------|-----------|--------|----------|
| pantry | `PANTRY_TODO.md` | In Progress | High |
| ts-cloud | `TSCLOUD_TODO.md` | Ready | Medium |
| bun-query-builder | `BUNQUERYBUILDER_TODO.md` | Complete | - |
| dynamodb-tooling | `DYNAMODB_TODO.md` | Complete | - |
| stx | `STX_TODO.md` | Complete | - |
| stacks | `STACKS_TODO.md` | Not Started | Low |
| bun-router | `BUNROUTER_TODO.md` | In Progress | Medium |
| ts-pkgx | `TSPKGX_TODO.md` | Not Started | Low |

---

## High Priority Tasks

### 1. Pantry Registry (pantry)
**File:** `PANTRY_TODO.md`

| Task | Status |
|------|--------|
| Build Custom Registry Driver | In Progress |
| Automate `pantry publish` End-to-End | ✅ Complete |
| GitHub Secrets Automation | Deferred |
| CI Workflow Naming Convention | ✅ Complete |
| Registry Analytics | Not Started |
| Zig Package Manager Support | Not Started |
| Minimal Registry UI | Not Started |
| Marketplace Features | Future |
| NPM Trusted Publisher Automation | Deferred |

**Vision:** Rebuild npm as independent registry → pivot to **marketplace** with paywalls.

**Key Architecture:**
- ts-cloud for S3 storage (tarballs)
- DynamoDB for metadata (via dynamodb-tooling)
- Fallback to npmjs if package not found
- Plain names in our registry, `@stacksjs/` prefix on npm if taken

---

### 2. ts-cloud Integration (ts-cloud)
**File:** `TSCLOUD_TODO.md`

| Task | Status |
|------|--------|
| S3 storage for package tarballs | Not Started |
| S3 storage for package metadata | Not Started |

**Note:** ts-cloud S3 client is production-ready. Just needs integration with pantry registry.

---

### 3. Publish bun-router (bun-router)
**File:** `BUNROUTER_TODO.md`

| Task | Status |
|------|--------|
| Prepare package for publish | In Progress |
| Test publish workflow via pantry | Not Started |
| Configure trusted publisher on npm | Not Started |

**Names:**
- Our registry: `bun-router`
- npm: `@stacksjs/bun-router`

---

## Completed Tasks

### 4. bun-query-builder
**File:** `BUNQUERYBUILDER_TODO.md`

**Architecture Decision:** SQL and DynamoDB are separate paradigms.

```typescript
// SQL (table-centric)
import { db } from 'bun-query-builder'
db.table('users').join('posts').where('name', 'John').get()

// DynamoDB (entity-centric) - extends dynamodb-tooling
import { dynamo } from 'bun-query-builder/dynamodb'
dynamo.entity('User').pk('USER#123').sk.beginsWith('POST#').get()
```

| Task | Status |
|------|--------|
| MySQL Driver | ✅ Complete |
| PostgreSQL Driver | ✅ Complete |
| SQLite Driver | ✅ Complete |
| DynamoDB Module (extends dynamodb-tooling) | ✅ Complete |

---

### 5. dynamodb-tooling
**File:** `DYNAMODB_TODO.md`

**Foundation for:** `bun-query-builder/dynamodb`

| Task | Status |
|------|--------|
| DynamoDB ORM Driver | ✅ Complete |
| Stacks Models → Single Table Design | ✅ Complete |
| Access Pattern Generator | ✅ Complete |
| GSI/LSI Derivation | ✅ Complete |
| Migration Tooling | ✅ Complete |
| Integration with bun-query-builder | ✅ Complete |

---

### 6. stx Heatmap
**File:** `STX_TODO.md`

| Task | Status |
|------|--------|
| Heatmap tracking library | ✅ Complete |
| Privacy compliant (no PII) | ✅ Complete |
| stx native component (`@heatmap` directive) | ✅ Complete |
| Configuration options | ✅ Complete |

---

## Low Priority / Future Tasks

### 7. Stacks Dashboard (stacks)
**File:** `STACKS_TODO.md`

| Task | Status |
|------|--------|
| Dashboard development | Background |
| Open Source Fathom Alternative | Not Started |

**Dev command:** `./buddy dev --dashboard`

---

### 8. ts-pkgx Build Automation (ts-pkgx)
**File:** `TSPKGX_TODO.md`

| Task | Status |
|------|--------|
| GitHub Action for building tools | Not Started |
| Automate publishing to registry | Not Started |

---

## Architecture Decisions

### SQL vs DynamoDB Separation

| SQL | DynamoDB |
|-----|----------|
| Table-centric | Entity-centric |
| `db.table('users')` | `dynamo.entity('User')` |
| JOINs for relationships | Denormalization |
| WHERE clauses | pk/sk key conditions |
| Multiple tables | Single table, multiple entity types |

**Don't unify what shouldn't be unified.**

### Storage Architecture

```
Pantry Registry
├── Tarballs → ts-cloud (S3)
├── Metadata → dynamodb-tooling (DynamoDB)
└── Fallback → npmjs (if not found)
```

### Registry → Marketplace Evolution

1. **Phase 1:** Package registry (npm alternative)
2. **Phase 2:** Analytics (download counts, etc.)
3. **Phase 3:** Marketplace (paywalls, monetization)

---

## Quick Reference

| What | Where |
|------|-------|
| Registry backend | `pantry/packages/registry/` |
| S3 client | `ts-cloud/packages/ts-cloud/src/aws/s3.ts` |
| DynamoDB ORM | `dynamodb-tooling/src/models/DynamoDBModel.ts` |
| Single-table design | `dynamodb-tooling/src/single-table/` |
| SQL query builder | `bun-query-builder/src/sql/` |
| DynamoDB query builder | `bun-query-builder/src/dynamodb/` |
| Heatmap | `stx/packages/stx/src/heatmap.ts` |
| Dashboard | `stacks` → `./buddy dev --dashboard` |

---

## Notes from Discord

- **CLI-Only Principle:** All user interaction through CLI, never redirect to browser
- **Token Storage:** `.env` for project-level, `~/.pantry` for user-level
- **npm limitation:** Trusted publisher requires browser 2FA - can't fully automate
- **Our registry:** First publish AND subsequent publishes fully automated
- **Zig support:** Pantry should be a package manager for Zig (no official one exists)
- **Differentiator:** We have actual support (good luck contacting npm support)
