# HTML Editor v1.2

## Changes from v1.1
- **State Management**: Added a `pageLoad()` function.
- **Lifecycle**: The editor now initializes with default code or clears the cache upon loading.
- **External Scripting**: Moved JavaScript logic into `JS/function.js`.

## Code Comparison
- **Lines of Code**: ~50 lines.
- **Difference**: Significant shift (+15 lines). This version introduces the separation of concerns by moving logic out of the HTML file and into a dedicated JS folder.