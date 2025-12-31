---
tags: [type/task]
status: in-progress
priority: p2
created: 2025-12-31
updated: 2025-12-31
parent:
children: []
github_issue:
---

# Task: AI Workflow Generation from Natural Language

## Task Details

**Task ID**: T-2025-005
**Status**: in-progress
**Priority**: p2
**Created**: 2025-12-31
**Completed**:
**GitHub Issue**:

## Description

Allow users to describe a workflow idea in natural language to Gemini, which returns a JSON schema defining the workflow. This auto-populates/generates a new workflow in FloImg Studio that users can then manually tweak.

Example user flow:

1. User clicks "Generate Workflow" or uses a command palette
2. User types: "Generate an AI image with DALL-E, resize it to 512x512, add a watermark, and save to disk"
3. Gemini analyzes the request and returns a workflow JSON
4. Studio parses the JSON and populates the canvas with connected nodes
5. User can then adjust parameters, add/remove nodes, and execute

## Acceptance Criteria

- [ ] New UI for natural language workflow input (modal, panel, or command palette)
- [ ] Backend endpoint that sends prompt to Gemini with workflow schema context
- [ ] Gemini returns valid workflow JSON matching Studio's workflow format
- [ ] Frontend parses JSON and creates nodes + edges on canvas
- [ ] Nodes are positioned in a readable layout (auto-layout)
- [ ] User can immediately edit/tweak the generated workflow
- [ ] Error handling for invalid/unparseable responses
- [ ] Loading state while Gemini processes request

## Implementation Details

### Technical Approach

**Prompt Engineering:**

- Provide Gemini with the workflow JSON schema
- Include list of available node types (generators, transforms, save)
- Include node parameter schemas
- Request structured JSON output

**Backend:**

- New endpoint: `POST /api/workflow/generate`
- Accepts: `{ prompt: string, apiKey?: string }`
- Returns: `{ workflow: WorkflowSchema }` or error

**Frontend:**

- New "Generate Workflow" button or command
- Modal/panel with text input
- Parse response and call `setNodes()` / `setEdges()`
- Auto-layout algorithm (dagre or similar)

### Packages Affected

- `apps/studio/backend/` - New generation endpoint
- `apps/studio/frontend/` - New UI component, workflow population logic
- `apps/studio/shared/` - Workflow schema types (if not already exported)

### Testing Required

- Unit tests for prompt construction
- Unit tests for JSON parsing and validation
- Integration test for end-to-end generation
- Manual testing with various workflow descriptions

## Dependencies

### Blocked By

- None (builds on T-2025-004 Gemini foundation)

### Related Tasks

- T-2025-004 - AI editing node (foundation work)
- T-2025-006 - Multi-reference images

## Progress Notes

### Work Log

- **2025-12-31**: Task created, branch `feat/T-2025-005-studio-ai-workflow`

## Review Checklist

- [ ] Code review completed
- [ ] Tests written and passing
- [ ] TypeScript types correct
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG updated (if user-facing)

## Notes

- Consider using Gemini's structured output mode for more reliable JSON
- May need to iterate on prompt engineering for best results
- Could add "explain this workflow" feature using same infrastructure
