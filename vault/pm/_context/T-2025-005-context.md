# Context: T-2025-005 & T-2025-006 Studio AI Enhancements

**Tasks**:

- [[T-2025-005-ai-workflow-generation]]
- [[T-2025-006-multi-reference-images]]

**Created**: 2025-12-31
**Branch**: `feat/T-2025-005-studio-ai-workflow`
**Status**: In Progress

## Overview

Two related AI enhancements for FloImg Studio, building on the T-2025-004 Gemini integration work:

### T-2025-005: AI Workflow Generation

Natural language → Workflow JSON → Auto-populate canvas

User describes what they want ("generate an image, resize it, save to disk") and Gemini returns a workflow schema that Studio automatically builds.

### T-2025-006: Multi-Reference Images

Support 1-14 reference images for gemini-generate and gemini-edit nodes per Google's API.

## Gemini API Research

### Multi-Reference Images (from Google docs)

Gemini 3 Pro supports up to 14 reference images:

- Up to 6 images of objects (high-fidelity inclusion)
- Up to 5 images of humans (character consistency)

**API format:**

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

### Workflow Generation

Need to:

1. Define the workflow JSON schema for Gemini
2. Include available node types and their parameters
3. Use structured output mode for reliable JSON

## Key Decisions

-

## Open Questions

1. UI design for workflow generation - modal, sidebar panel, or command palette?
2. How to handle React Flow multi-input nodes elegantly?
3. Should we validate workflow JSON against a schema before applying?

## Next Steps

1. Explore current workflow schema in apps/studio/shared
2. Research React Flow multi-handle patterns
3. Design UI mockup for workflow generation
4. Implement multi-reference image support first (smaller scope)
