# Panel Hierarchy Rendering

This document describes the implementation of hierarchical panel rendering in the React Native Survey.js UI library.

## Overview

The Panel component supports nested panel hierarchies with the following features:
- Recursive rendering of arbitrarily nested panels
- Circular reference detection
- Maximum nesting depth limits
- Context-based nesting level tracking
- Optimized React key generation

## Architecture

### Context-Based Design

The implementation uses React Context (`PanelNestingContext`) to track:
- **nestingLevel**: Current depth in the hierarchy (0 for root panels)
- **panelPath**: Array of panel names from root to current panel
- **panelNamesInPath**: Set for efficient circular reference detection
- **maxNestingDepth**: Configurable maximum depth (default: 10)

### Component Structure

```
Panel (wrapper)
├── PanelNestingProvider (initial context)
└── PanelContent (actual implementation)
    ├── PanelHeader
    ├── Questions (via QuestionFactory)
    └── Nested Panels
        └── PanelNestingProvider (updated context)
            └── PanelContent (recursive)
```

## Key Features

### 1. Circular Reference Detection

Prevents infinite loops by tracking panel names in the current path:

```typescript
if (panelNamesInPath.has(panel.name)) {
  console.warn(`Circular reference detected for panel: ${panel.name}`);
  return null;
}
```

### 2. Maximum Nesting Depth

Limits recursion depth to prevent performance issues:

```typescript
if (effectiveNestingLevel >= maxNestingDepth) {
  console.warn(`Maximum nesting depth exceeded for panel: ${panel.name}`);
  return null;
}
```

### 3. React Key Generation

Generates stable, unique keys for nested panels:
- Keys include the full path to ensure uniqueness
- Index is added to handle multiple panels with the same name
- Format: `panel-{path}-{name}-{index}`

### 4. Visual Hierarchy

Nested panels receive styling based on their depth:
- Indentation increases with nesting level
- Visual borders indicate hierarchy
- Responsive design adjusts indentation for different screen sizes

## Usage Example

```typescript
const surveyJson = {
  pages: [{
    panels: [{
      name: "demographics",
      title: "Demographics",
      questions: [/* ... */],
      panels: [{
        name: "address",
        title: "Address Information",
        questions: [/* ... */]
      }]
    }]
  }]
};
```

## Performance Considerations

1. **Memoization**: Context values are memoized to prevent unnecessary re-renders
2. **Shallow Nesting**: Recommended to keep nesting under 5 levels for optimal performance
3. **Key Stability**: Keys remain stable across re-renders unless structure changes

## Testing

The implementation includes comprehensive tests for:
- Basic nested rendering
- Circular reference detection
- Maximum depth enforcement
- Performance with deep/wide hierarchies
- Integration with other panel features

## Best Practices

1. **Naming**: Use unique, descriptive panel names
2. **Depth**: Keep nesting reasonable (< 5 levels recommended)
3. **Structure**: Design surveys with logical grouping rather than deep nesting
4. **Validation**: Always test with production-like data to ensure performance

## Future Enhancements

- Configurable per-panel depth limits
- Performance optimizations for very deep hierarchies
- Virtual scrolling for panels with many children
- Lazy loading of deeply nested content