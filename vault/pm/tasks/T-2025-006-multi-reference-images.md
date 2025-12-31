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

# Task: Multi-Reference Image Support for Gemini Nodes

## Task Details

**Task ID**: T-2025-006
**Status**: in-progress
**Priority**: p2
**Created**: 2025-12-31
**Completed**:
**GitHub Issue**:

## Description

Update gemini-generate and gemini-edit nodes to support 1-14 reference images as described in the Google Gemini API documentation.

Reference: https://ai.google.dev/gemini-api/docs/image-generation#use-14-images

Gemini 3 Pro supports:

- Up to 14 reference images total
- Up to 6 images of objects (high-fidelity inclusion)
- Up to 5 images of humans (character consistency)

This enables workflows like:

- Style transfer: "Generate an image in the style of these 3 reference images"
- Character consistency: "Generate a new scene with this character"
- Object composition: "Combine these objects into a single scene"

## Acceptance Criteria

- [ ] gemini-generate node accepts multiple image inputs (1-14)
- [ ] gemini-edit node accepts multiple reference images alongside the edit target
- [ ] UI allows connecting multiple image sources to a single Gemini node
- [ ] Backend properly formats multiple images as inline_data parts
- [ ] Clear documentation on image limits and best practices
- [ ] Graceful error handling when exceeding image limits
- [ ] Optional: Categorize images as "object" vs "character" for better results

## Implementation Details

### Technical Approach

**API Format (from Google docs):**

```json
{
  "contents": [
    {
      "parts": [
        { "text": "Your prompt here" },
        { "inline_data": { "mimeType": "image/jpeg", "data": "<BASE64_1>" } },
        { "inline_data": { "mimeType": "image/jpeg", "data": "<BASE64_2>" } }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "imageConfig": {
      "aspectRatio": "5:4",
      "imageSize": "2K"
    }
  }
}
```

**Node Changes:**

- Add `referenceImages` parameter (array of image inputs)
- Update node UI to show multiple input handles
- Add validation for max 14 images

**Backend Changes:**

- Modify Gemini API call to include multiple inline_data parts
- Handle array of images from frontend

**React Flow Considerations:**

- Multiple input handles on a single node
- Visual indication of how many images are connected

### Packages Affected

- `packages/floimg-google/` - Multi-image support in Gemini API calls
- `apps/studio/backend/` - Handle array of images in execution
- `apps/studio/frontend/` - Multi-input node UI
- `apps/studio/shared/` - Update node type definitions

### Testing Required

- Unit tests for multi-image API formatting
- Integration test with 2-3 reference images
- Edge case testing (0 images, 14 images, 15+ images)
- Manual testing of node connection UX

## Dependencies

### Blocked By

- None (builds on T-2025-004 Gemini foundation)

### Related Tasks

- T-2025-004 - AI editing node (foundation work)
- T-2025-005 - AI workflow generation

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

- Google docs mention up to 14 images, but there are sub-limits (6 objects, 5 humans)
- Consider adding image "role" parameter (object/character/style) for advanced users
- May want to show a preview of connected reference images in the node
