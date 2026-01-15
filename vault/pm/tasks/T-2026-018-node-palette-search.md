---
tags: [type/task]
status: backlog
priority: p3
created: 2026-01-15
updated: 2026-01-15
---

# Task: Add Search to Node Palette

## Task Details
- **Task ID**: T-2026-018
- **Status**: backlog
- **Priority**: p3
- **Created**: 2026-01-15

## Problem

As the number of available nodes grows, users struggle to find specific nodes in the left panel. They have to scroll through categories to find what they need.

## Solution

Add a search/filter input at the top of the node palette:
1. Filter nodes by name as user types
2. Search across all categories
3. Show matching nodes inline or in a flat list
4. Highlight matching text in results

## Design Considerations

- Search input should be always visible at top of palette
- Consider keyboard shortcut to focus search (Cmd+K or /)
- Clear button to reset filter
- Show "No results" state when nothing matches
- Consider fuzzy matching for typo tolerance

## Acceptance Criteria

- [ ] Search input at top of node palette
- [ ] Typing filters nodes across all categories
- [ ] Matching nodes are displayed clearly
- [ ] Search is fast/responsive
- [ ] Clear button resets to full list

## Related

- Node palette component
- BUG-2026-001 (missing nodes - search helps discoverability)
