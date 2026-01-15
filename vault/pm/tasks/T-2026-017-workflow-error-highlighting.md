---
tags: [type/task]
status: backlog
priority: p2
created: 2026-01-15
updated: 2026-01-15
---

# Task: Highlight Failed Nodes in Workflow Canvas

## Task Details
- **Task ID**: T-2026-017
- **Status**: backlog
- **Priority**: p2
- **Created**: 2026-01-15

## Problem

When workflow execution fails, the error message appears at the top of the screen but doesn't indicate which specific node(s) failed. Users have to guess or manually inspect each node.

## Solution

Visually highlight failed nodes in the workflow canvas:
1. Add red border/glow to nodes that errored
2. Show error icon badge on failed nodes
3. Clicking failed node shows error details
4. Consider: highlight the path that led to the failure

## Design Considerations

- Error state should be visually distinct (red border, error icon)
- Don't clutter the UI - only show on execution failure
- Clear error state when user re-executes or modifies workflow
- Consider animating to draw attention to the failed node

## Acceptance Criteria

- [ ] Failed nodes have distinct visual treatment (red border/icon)
- [ ] Clicking failed node shows error message
- [ ] Error state clears on re-execution
- [ ] Works for multiple failures (show all failed nodes)

## Related

- BUG-2026-002 (composite undefined error)
- Workflow execution feedback
