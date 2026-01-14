---
phase: 11-team-collaboration
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, teams, migrations]

# Dependency graph
requires:
  - phase: 07-saas-transformation
    provides: profiles table, repositories table, Stripe integration
provides:
  - teams table with owner, seats, usage tracking
  - team_members table with role-based access
  - team_invitations table with token-based invites
  - doc_templates table for custom prompts
  - usage_logs table for analytics
  - RLS policies for all team tables
  - Helper functions for team membership checks
affects: [11-02, 11-03, 11-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - RLS policies with team membership checks
    - Auto-create owner membership via trigger
    - Token-based invitation system

key-files:
  created:
    - supabase/migrations/20260115_add_teams_schema.sql
  modified:
    - src/lib/types.ts

key-decisions:
  - "Combined all SQL (tables, indexes, RLS, functions) into single migration file"
  - "Used SECURITY DEFINER on helper functions for RLS bypass"
  - "Added partial index for team_id on repositories (WHERE NOT NULL)"

patterns-established:
  - "Team membership check via subquery in RLS policies"
  - "Auto-membership creation via AFTER INSERT trigger"

issues-created: []

# Metrics
duration: 8min
completed: 2026-01-15
---

# Phase 11 Plan 01: Database Schema for Teams Summary

**Complete database foundation for team collaboration with 5 tables, 15 RLS policies, 3 helper functions, and auto-membership trigger**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-15T12:00:00Z
- **Completed:** 2026-01-15T12:08:00Z
- **Tasks:** 5/5
- **Files modified:** 2

## Accomplishments

- Created 5 new tables: teams, team_members, team_invitations, doc_templates, usage_logs
- Added team_id to repositories and default_team_id to profiles
- Implemented 15 RLS policies covering all CRUD operations with team membership checks
- Created 3 helper functions: is_team_member, is_team_admin, get_team_usage
- Added trigger to auto-create owner membership when team is created
- Added TypeScript interfaces for all new entities

## Task Commits

Each task was committed atomically:

1. **Tasks 1-4: Database migration** - `63dedfc` (feat)
   - Tables, indexes, RLS policies, helper functions, trigger
2. **Task 5: TypeScript types** - `834cccb` (feat)
   - Added Team, TeamMember, TeamInvitation, DocTemplate, UsageLog, TeamUsage interfaces

**Plan metadata:** Pending (docs: complete plan)

## Files Created/Modified

- `supabase/migrations/20260115_add_teams_schema.sql` - Complete team collaboration schema (385 lines)
- `src/lib/types.ts` - Added 6 new TypeScript interfaces for team entities

## Decisions Made

1. **Single migration file** - Combined tables, indexes, RLS, and functions into one migration for atomic deployment
2. **SECURITY DEFINER functions** - Helper functions use SECURITY DEFINER to bypass RLS when checking membership
3. **Partial index for team repos** - Used `WHERE team_id IS NOT NULL` for efficient team repository lookups
4. **ON DELETE CASCADE vs SET NULL** - CASCADE for team-owned data, SET NULL for usage logs to preserve analytics

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - migration created successfully.

## Next Phase Readiness

- Database schema ready for team API endpoints (Plan 11-02)
- TypeScript types available for frontend components
- RLS policies will enforce team-based access automatically
- Helper functions ready for server-side membership checks

---
*Phase: 11-team-collaboration*
*Completed: 2026-01-15*
