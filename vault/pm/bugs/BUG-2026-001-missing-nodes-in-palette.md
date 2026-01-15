---
tags: [type/bug]
status: backlog
priority: p2
created: 2026-01-15
updated: 2026-01-15
---

# Bug: Some Node Types Missing from Palette

## Bug Details
- **Bug ID**: BUG-2026-001
- **Status**: backlog
- **Priority**: p2
- **Created**: 2026-01-15

## Problem

The AI Workflow Generator creates workflows containing node types (e.g., `removeBackground`) that don't appear in the left panel node palette. Users can't manually add these nodes or understand what they do.

## Affected Nodes

- `removeBackground` - Stability AI background removal (from `floimg-stability`)
- Possibly others from plugin packages

## Expected Behavior

All node types that can appear in a workflow should be discoverable in the node palette.

## Root Cause

The node palette is populated from the registry's `getCapabilities()`. Plugin transforms like `removeBackground` from `floimg-stability` may not be properly registered or categorized for display.

## Investigation Needed

1. Check if `removeBackground` is registered in the transforms list
2. Check if the palette filters out certain transform types
3. Verify all `floimg-*` plugin nodes appear in the palette

## Acceptance Criteria

- [ ] All registered node types appear somewhere in the palette
- [ ] `removeBackground` is visible and usable from the palette
- [ ] Plugin nodes are properly categorized (AI section, etc.)

## Related

- Node registry in `apps/studio/backend/src/floimg/registry.ts`
- `floimg-stability` package
